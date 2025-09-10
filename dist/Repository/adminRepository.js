"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createManagerKeybord = exports.adminRepository = void 0;
const telegraf_1 = require("telegraf");
class adminRepository {
    constructor(pool) {
        this.pool = pool;
    }
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
        const result = await this.pool.query(queryText);
        return result.rows.map(row => ({ id: row.id, name: `Менеджер ${row.id}` }));
    }
    ;
    async deleteUserRole(userId, roleId) {
        const queryText = `
            DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2
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
    ;
    async deleteUser(id) {
        const queryText = `
            DELETE FROM users WHERE id = $1 
            `;
        const params = [id];
        const result = await this.pool.query(queryText, params);
        if ((result.rowCount ?? 0) > 0) {
            return true;
        }
        else {
            return false;
        }
        ;
    }
    ;
    async getTotalFdOrRdAmountbyManager(id, fd_rd_total, startDate, endDate) {
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
    }
    ;
    async getTotalAmountByManager(id, startDate, endDate) {
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
    }
    ;
    async getAllFdOrRdOrdersByManager(id, fd_rd_total, startDate, endDate) {
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
    }
    ;
    async getAllOrdersByManager(id, startDate, endDate) {
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
}
exports.adminRepository = adminRepository;
;
const createManagerKeybord = (managers) => {
    const managerButtons = managers.map(manager => `${manager?.name || `👨‍💼Менеджер ${manager.id}`}`);
    const backButton = [`🚪Выйти`];
    const rows = [];
    for (let i = 0; i < managerButtons.length; i += 2) {
        rows.push(managerButtons.slice(i, i + 2));
    }
    rows.push(backButton);
    return telegraf_1.Markup.keyboard(rows).resize().oneTime();
};
exports.createManagerKeybord = createManagerKeybord;
