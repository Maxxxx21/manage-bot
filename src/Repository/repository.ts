import { pool, query } from "../utils/db.js";
import { Pool } from "pg";

export interface IOrder { 
    manager_id: number,
    droper_id: number | null,  
    number: string,
    fd_rd: 'fd' | 'rd', 
    cardholder_name: string, 
    amount: string, 
    status: 'open' | 'taken' | 'closed', 
    created_at: Date, 
    update_at: Date, 
}

export interface IOrderRepository {
    insertOrder(manager_id: number, droper_id: number | null, number: string, cardholder_name: string, fd_rd: 'fd' | 'rd', amount: string ): any;
    takeOrHandleOrder(id:number, status: string, droperId:number): Promise<boolean> 
    addScreenshot(order_id: number, file_id: string): any;
    getAllUsersByRole(role: string): Promise<number[]>;
    checkRegisteredUser(user_id: number, role_id: number): any;
    addUser(telegram_id:number): any;
    getUser(telegram_id:number): any;
    addRoleToUser(userId: number, roleName: string): any;
    getRoleIdByName(role: string): Promise<number | null>;
    getAllDropers(): any;
    getOrderById(id: number): any;
    getTelegramIdById(id: number): any;
    removeDroperFromOrderAndSetStatusOpen(orderId: number): any;
    updateOrderStatus(orderId: number, status: string): any;
    insertCommentInOrder(orderId: number, comment: string): any;
    getOrdersByIbanFd(number: string): any;
}

export class Repository implements IOrderRepository{ 
    
    constructor(private pool: Pool) {}

        async insertOrder(
            manager_id: number,
            droper_id: number| null,
            number: string,
            cardholder_name: string,
            fd_rd: 'fd' | 'rd',
            amount: string
        )  {

            const queryText = `
            INSERT INTO orders (manager_id, droper_id, number, cardholder_name, fd_rd, amount)
            VALUES($1, $2, $3, $4, $5, $6)
            RETURNING *;
            `

        const params = [manager_id, droper_id, number, cardholder_name, fd_rd, amount]; 
        const result = await this.pool.query(queryText, params);
        
        return result.rows[0]; 

        }
        async takeOrHandleOrder(id:number, status: string, droperId:number): Promise<boolean> {
            const client = await this.pool.connect();
            try {
                await client.query(`BEGIN`);

                const queryText = `
                UPDATE orders SET status = $2, droper_id = $3, updated_at = NOW() WHERE id = $1 AND status = 'open' RETURNING *
                `; 
                const params = [id, status, droperId]; 
                const result = await client.query(queryText, params);

                if(result.rowCount === 0) {
                    await client.query(`ROLLBACK`);
                    return false;
                }

                await client.query(`COMMIT`); 
                return true; 
                } catch(error) {
                    await client.query(`ROLLBACK`);
                    throw error;
                } finally {
                    client.release();
                }
        }   

        async addScreenshot(order_id: number, file_id: string) {
            const queryText = `
            INSERT INTO order_screenshots (order_id, file_id)
            VALUES ($1, $2)
            RETURNING *
            `; 
            const params = [order_id,file_id]; 
            const result = await this.pool.query(queryText, params); 
            return result.rows[0];
        };

        async getAllUsersByRole(role: string): Promise<number[]> {
            const queryText = `
           SELECT u.telegram_id
           FROM roles r
           JOIN user_roles ur ON r.id = ur.role_id
           JOIN users u ON ur.user_id = u.id
           WHERE r.role = $1
            `;

            const params = [role]; 
            const result = await this.pool.query(queryText, params); 
            return result.rows.map(row => row.telegram_id);
        };

        async checkRegisteredUser(user_id: number, role_id: number) {
            const queryText = `
            SELECT EXISTS (
                SELECT 1 
                FROM user_roles ur
                JOIN users u ON ur.user_id = u.id
                WHERE user_id = $1
                    AND role_id = $2
                    AND u.is_active = TRUE
            );
            `;

            const params = [user_id, role_id];
            const result = await this.pool.query(queryText, params);
            return result.rows[0].exists;
        }

        async addUser(telegram_id:number) { 
            const queryText = `
            INSERT INTO users (telegram_id) VALUES ($1) RETURNING id;
            `; 
            
            const params = [telegram_id]; 
            const result = await this.pool.query(queryText, params); 
            return result.rows[0]; 
        };

        async getUser(telegram_id: number) { 
            const queryText = `
            SELECT id FROM users WHERE telegram_id = $1
            `; 

            const params = [telegram_id];
            const result = await this.pool.query(queryText, params);
            return result.rows[0]?.id;
        }; 

        async addRoleToUser(userId: number, roleName: string) { 
            const queryText = `
            INSERT INTO user_roles (user_id, role_id)
            VALUES (
                $1,
                (SELECT id FROM roles WHERE role = $2)
            ) RETURNING *;
            `;

            const params = [userId, roleName];
            const result = await this.pool.query(queryText, params);
            return result.rows[0];
        };

        async getUserWithRole(userId: number, roleId: number | null) {
            const queryText = `
            SELECT
                ur.user_id,
                ur.role_id
            FROM
                user_roles ur
            JOIN users u ON ur.user_id = u.id
            WHERE
                ur.user_id = $1
                AND ur.role_id = $2
                AND u.is_active = TRUE; 
            `;

            const params = [userId, roleId];
            const result = await this.pool.query(queryText, params);
            
            if((result.rowCount ?? 0)> 0 ) {
                return true;
            } else {
                return false;
            };
        }

        async getRoleIdByName(role: string): Promise<number | null> { 
            const queryText = 
           `SELECT id FROM roles WHERE role = $1`;

            const params = [role];
            try {
            const result = await this.pool.query(queryText, params);
            
            if (result.rows.length > 0) {
                return result.rows[0].id
            }
            
            return null;
        } catch(error) {
            console.error(`Ошибка при поиске ID роли '${role}':`, error);
            return null;
        }
    }

        async getAllDropers() {
            const queryText = `
            SELECT
                u.id,
                u.telegram_id
            FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE r.role = '⛑️Дропер';
            `; 

            const result = await this.pool.query(queryText)
            // return result.rows.map(row => ({id: row.id, telegram_id: row.telegram_id}));
            return result.rows;
        };

        async getOrderById(orderId: number) {
            const queryText = `
            SELECT * FROM orders WHERE id = $1;
            `; 
 
            const params = [orderId];
            const result: any = await this.pool.query(queryText, params);
            
            return result.rows[0] || null;
        }

        async getTelegramIdById(id: number) {
            const queryText = `
            SELECT telegram_id FROM users WHERE id = $1;
            `;

            const params = [id]; 
            const result = await this.pool.query(queryText, params);

            return result.rows[0].telegram_id; 
        };

        async removeDroperFromOrderAndSetStatusOpen(orderId: number) {
            const queryText = `
            UPDATE orders SET droper_id = NULL, status = 'open' WHERE id = $1 RETURNING *;
            `; 

            const params = [orderId];
            const result = await this.pool.query(queryText, params);

            return result.rows[0];
        };

        async updateOrderStatus(orderId: number, status: string) {
            const queryText = `
            UPDATE orders SET status = $2 WHERE id = $1 RETURNING *;
            `;

            const params = [orderId, status];
            const result = await this.pool.query(queryText,params);
            
            return result.rows[0];
        }; 

        async insertCommentInOrder(orderId: number, comment: string) {
            const queryText = `
            UPDATE orders SET droper_comment = $2, status = 'failed' WHERE id = $1 RETURNING *;
            `;

            const params = [orderId, comment]; 
            const result = await this.pool.query(queryText, params);

            return result.rows[0];
        }; 


        async getOrdersByIbanFd(number: string) {
            const queryText = `
            SELECT id, number, cardholder_name, fd_rd, amount, created_at FROM orders WHERE number = $1;
            `;

            const params = [number];
            const result = await this.pool.query(queryText, params);

            return result.rows;
        };

        async getAllOpenOrders() { 
            const queryText = `
            SELECT * FROM orders WHERE status = 'open';
            `;

            const result = await this.pool.query(queryText);
            return result.rows;
        }

}
