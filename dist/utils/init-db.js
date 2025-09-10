"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
(async () => {
    try {
        await (0, db_1.query)(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY, 
            telegram_id BIGINT UNIQUE NOT NULL,
            role VARCHAR (20) NOT NULL CHECK(role IN ('Менеджер', 'Дроппер', 'Админ')), 
            created_at TIMESTAMP DEFAULT NOW()
            );
        `, []);
        await (0, db_1.query)(`
            CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            manager_id INT REFERENCES users(id),
            dropper_id INT REFERENCES users(id), 
            number VARCHAR(39) NOT NULL, 
            fd_rd TEXT NOT NULL,
            cardholder_name TEXT NOT NULL,
            amount  NUMERIC (12,2), 
            status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'taken', 'done')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW() 
            );
            `, []);
        await (0, db_1.query)(`CREATE TABLE IF NOT EXISTS order_screenshots (
            id SERIAL PRIMARY KEY,
            order_id INT REFERENCES orders(id) ON DELETE CASCADE, 
            file_id TEXT NOT NULL, 
            created_at TIMESTAMP
            DEFAULT NOW()
        );
        `, []);
        console.log("Таблицы  была успешно создана.");
    }
    catch (err) {
        console.error(`Ошибка при создании таблиц: `, err);
        process.exit(1);
    }
    ;
})();
