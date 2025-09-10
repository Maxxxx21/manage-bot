"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
class Repository {
    constructor(pool) {
        this.pool = pool;
    }
    async insertOrder(manager_id, dropper_id, number, cardholder_name, fd_rd, amount) {
        const queryText = `
            INSERT INTO orders (manager_id, dropper_id, number, cardholder_name, fd_rd, amount)
            VALUES($1, $2, $3, $4, $5, $6)
            RETURNING *;
            `;
        const params = [manager_id, dropper_id, number, cardholder_name, fd_rd, amount];
        const result = await this.pool.query(queryText, params);
        return result.rows[0];
    }
    async updateStatus(id, status) {
        const queryText = `
            UPDATE orders SET status = $2, updated_at = NOW() where id = $1 RETURNING *
            `;
        const params = [id, status];
        const result = await this.pool.query(queryText, params);
        return result.rows[0];
    }
    ;
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
    async userRegistration(telegram_id, role) {
        const queryText = `
            INSERT INTO users (telegram_id, role)
            VALUES ($1, $2)
            RETURNING *
            `;
        const params = [telegram_id, role];
        const result = await this.pool.query(queryText, params);
        return result.rows[0];
    }
    ;
    async getAllUsersByRole(role) {
        const queryText = `
            SELECT telegram_id from users WHERE role = $1
            `;
        const params = [role];
        const result = await this.pool.query(queryText, params);
        return result.rows.map(row => row.telegram_id);
    }
}
exports.Repository = Repository;
;
