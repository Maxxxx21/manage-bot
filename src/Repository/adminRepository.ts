import { pool } from "../utils/db.js";
import { Pool } from "pg";
import { Markup } from "telegraf";

export interface IAdminRepository {
    getAllManagersForAdmin():any;
    deleteUserRole(userId: number, roleId: number | null): any;
    deleteUser(id: number): any;
    getTotalFdOrRdAmountbyManager(id: number, fd_rd_total: string, startDate: string, endDate: string): any;
    getTotalAmountByManager(id: number, startDate: string, endDate: string): any;
    getAllFdOrRdOrdersByManager(id: number, fd_rd_total: string, startDate: string, endDate: string): any;
    getAllOrdersByManager(id: number, startDate: string, endDate: string): any;
    
}

export class adminRepository implements IAdminRepository { 
    constructor(private pool: Pool) {}
        
        async getAllManagersForAdmin() {
            const queryText = `
            SELECT
                u.id,
                u.telegram_id
            FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE r.role = '👨‍💼Менеджер';
            `; 

            const result = await this.pool.query(queryText)
            return result.rows.map(row => ({id: row.id, name: `Менеджер ${row.id}`}));
        };   
        
        async deleteUserRole(userId: number, roleId: number | null) {
            const queryText = `
            DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2
            `;

            const params = [userId, roleId];
            const result = await this.pool.query(queryText, params);

            if ((result.rowCount ?? 0) > 0 ) { 
                return true;
            } else {
                return false;
            };
         }; 

         async deleteUser(id: number) {
            const queryText = `
            DELETE FROM users WHERE id = $1 
            `;

            const params = [id];
            const result = await this.pool.query(queryText, params);

            if ((result.rowCount ?? 0) > 0 ) { 
                return true;
            } else {
                return false;
            };
         };

         async getTotalFdOrRdAmountbyManager(id: number, fd_rd_total: string, startDate: string, endDate: string) {  // функция получения общей сумму ордеров по fd или rd
             const queryText = `
            SELECT COALESCE(SUM(amount), 0) AS total_fd_amount
             FROM orders
             WHERE manager_id = $1
             AND fd_rd = $2
             AND status = 'done'
             AND created_at >= COALESCE($3::date, $4::date)
             AND created_at < COALESCE($4::date , $3::date) + INTERVAL '1 day';
             `;
            
             const params = [id, fd_rd_total, startDate, endDate];
             const result = await this.pool.query(queryText, params);
             return result.rows[0];
         }; 

         async getTotalAmountByManager(id: number, startDate: string, endDate: string) { // функция получения общей сумму ордеров
            const queryText = `
            SELECT COALESCE(SUM(amount), 0) AS total_amount
             FROM orders
             WHERE manager_id = $1
             AND status = 'done'
             AND created_at >= COALESCE($2::date, $3::date)
             AND created_at < COALESCE($3::date , $2::date) + INTERVAL '1 day';
             `;

            const params = [id, startDate, endDate]; 
            const result = await this.pool.query(queryText, params);
            return result.rows[0]; 
         };

         async getAllFdOrRdOrdersByManager(id: number, fd_rd_total: string, startDate: string, endDate: string) { // функция получения всех ордеров (amount, number, cardholder, created_at) по fd или rd
            const queryText = `
            SELECT id, number, fd_rd, amount, cardholder_name, created_at
             FROM orders
             WHERE manager_id = $1
             AND fd_rd = $2
             AND status = 'done'
             AND created_at >= COALESCE($3::date, $4::date)
             AND created_at < COALESCE($4::date , $3::date) + INTERVAL '1 day';
             `;

            const params = [id, fd_rd_total, startDate, endDate];
            const result = await this.pool.query(queryText, params);
            return result.rows;
         }; 

         async getAllOrdersByManager(id: number, startDate: string, endDate: string) {
            const queryText = `
            SELECT id, number, fd_rd, amount, cardholder_name, created_at
             FROM orders
             WHERE manager_id = $1
             AND status = 'done'
             AND created_at >= COALESCE($2::date, $3::date)
             AND created_at < COALESCE($3::date , $2::date) + INTERVAL '1 day';
             `;

             const params = [id, startDate, endDate]; 
             const result = await this.pool.query(queryText, params); 
             return result.rows;
         }
};


export const createManagerKeybord = (managers: Array<{id: number, name: string | undefined}>) => { 

    const managerButtons = managers.map(manager => `${manager?.name || `👨‍💼Менеджер ${manager.id}`}`);
    const backButton = [`🚪Выйти`];

    const rows = []; 

    for(let i = 0; i< managerButtons.length; i += 2) {
        rows.push(managerButtons.slice(i, i + 2));
    }
    rows.push(backButton);

    return Markup.keyboard(rows).resize().oneTime();
}