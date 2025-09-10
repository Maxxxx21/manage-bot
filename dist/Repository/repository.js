"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
class Repository {
    constructor(pool) {
        this.pool = pool;
    }
    async insertOrder(manager_id, droper_id, number, cardholder_name, fd_rd, amount) {
        const queryText = `
            INSERT INTO orders (manager_id, droper_id, number, cardholder_name, fd_rd, amount)
            VALUES($1, $2, $3, $4, $5, $6)
            RETURNING *;
            `;
        const params = [manager_id, droper_id, number, cardholder_name, fd_rd, amount];
        const result = await this.pool.query(queryText, params);
        return result.rows[0];
    }
    async takeOrHandleOrder(id, status, droperId) {
        const client = await this.pool.connect();
        try {
            await client.query(`BEGIN`);
            const queryText = `
                UPDATE orders SET status = $2, droper_id = $3, updated_at = NOW() WHERE id = $1 AND status = 'open' RETURNING *
                `;
            const params = [id, status, droperId];
            const result = await client.query(queryText, params);
            if (result.rowCount === 0) {
                await client.query(`ROLLBACK`);
                return false;
            }
            await client.query(`COMMIT`);
            return true;
        }
        catch (error) {
            await client.query(`ROLLBACK`);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async addScreenshot(order_id, file_id) {
        const queryText = `
            INSERT INTO order_screenshots (order_id, file_id)
            VALUES ($1, $2)
            RETURNING *
            `;
        const params = [order_id, file_id];
        const result = await this.pool.query(queryText, params);
        return result.rows[0];
    }
    ;
    async getAllUsersByRole(role) {
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
    }
    ;
    async checkRegisteredUser(user_id, role_id) {
        const queryText = `
            SELECT EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = $1 AND role_id = $2
            );
            `;
        const params = [user_id, role_id];
        const result = await this.pool.query(queryText, params);
        return result.rows[0].exists;
    }
    async addUser(telegram_id) {
        const queryText = `
            INSERT INTO users (telegram_id) VALUES ($1) RETURNING id;
            `;
        const params = [telegram_id];
        const result = await this.pool.query(queryText, params);
        return result.rows[0];
    }
    ;
    async getUser(telegram_id) {
        const queryText = `
            SELECT id FROM users WHERE telegram_id = $1
            `;
        const params = [telegram_id];
        const result = await this.pool.query(queryText, params);
        return result.rows[0]?.id;
    }
    ;
    async addRoleToUser(userId, roleName) {
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
    }
    ;
    async getUserWithRole(userId, roleId) {
        const queryText = `
            SELECT
                user_id,
                role_id
            FROM
                user_roles
            WHERE
                user_id = $1 AND role_id = $2;
            `;
        const params = [userId, roleId];
        const result = await this.pool.query(queryText, params);
        if ((result.rowCount ?? 0) > 0) {
            return true;
        }
        else {
            return false;
        }
        ;
    }
    async getRoleIdByName(role) {
        const queryText = `SELECT id FROM roles WHERE role = $1`;
        const params = [role];
        try {
            const result = await this.pool.query(queryText, params);
            if (result.rows.length > 0) {
                return result.rows[0].id;
            }
            return null;
        }
        catch (error) {
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
        const result = await this.pool.query(queryText);
        // return result.rows.map(row => ({id: row.id, telegram_id: row.telegram_id}));
        return result.rows;
    }
    ;
    async getOrderById(orderId) {
        const queryText = `
            SELECT * FROM orders WHERE id = $1;
            `;
        const params = [orderId];
        const result = await this.pool.query(queryText, params);
        return result.rows[0] || null;
    }
    async getTelegramIdById(id) {
        const queryText = `
            SELECT telegram_id FROM users WHERE id = $1;
            `;
        const params = [id];
        const result = await this.pool.query(queryText, params);
        return result.rows[0].telegram_id;
    }
    ;
    async removeDroperFromOrderAndSetStatusOpen(orderId) {
        const queryText = `
            UPDATE orders SET droper_id = NULL, status = 'open' WHERE id = $1 RETURNING *;
            `;
        const params = [orderId];
        const result = await this.pool.query(queryText, params);
        return result.rows[0];
    }
    ;
    async updateOrderStatus(orderId, status) {
        const queryText = `
            UPDATE orders SET status = $2 WHERE id = $1 RETURNING *;
            `;
        const params = [orderId, status];
        const result = await this.pool.query(queryText, params);
        return result.rows[0];
    }
    ;
    async insertCommentInOrder(orderId, comment) {
        const queryText = `
            UPDATE orders SET droper_comment = $2, status = 'failed' WHERE id = $1 RETURNING *;
            `;
        const params = [orderId, comment];
        const result = await this.pool.query(queryText, params);
        return result.rows[0];
    }
    ;
    async getOrdersByIbanFd(number) {
        const queryText = `
            SELECT id, number, cardholder_name, fd_rd, amount FROM orders WHERE number = $1;
            `;
        const params = [number];
        const result = await this.pool.query(queryText, params);
        return result.rows;
    }
    ;
    async getAllOpenOrders() {
        const queryText = `
            SELECT * FROM orders WHERE status = 'open';
            `;
        const result = await this.pool.query(queryText);
        return result.rows;
    }
}
exports.Repository = Repository;
