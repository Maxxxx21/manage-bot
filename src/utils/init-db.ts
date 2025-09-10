import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
    user: process.env.DB_USER, 
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, 
    port: parseInt(process.env.DB_PORT || '5432', 10),  
}); 

( async () => {
    const client = await pool.connect();
    try{

        await client.query(`BEGIN`, []);

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY, 
            telegram_id BIGINT UNIQUE NOT NULL, 
            created_at TIMESTAMP DEFAULT NOW()
            );
        `, []);

        await client.query(`
            CREATE TABLE IF NOT EXISTS roles (
            id SERIAL PRIMARY KEY,
            role VARCHAR(20) UNIQUE NOT NULL CHECK(role IN ('👨‍💼Менеджер', '⛑️Дропер', '👨‍💼Админ'))
            );
            `, []); 
        
        await client.query(`
            INSERT INTO roles (role) VALUES ('👨‍💼Менеджер')
            ON CONFLICT (role) DO NOTHING
            `, []);
        
        await client.query(`
            INSERT INTO roles (role) VALUES ('⛑️Дропер')
            ON CONFLICT (role) DO NOTHING
            `, []);

        await client.query(`
            INSERT INTO roles (role) VALUES ('👨‍💼Админ')
            ON CONFLICT (role) DO NOTHING
            `, []);

            console.log('Роли были успешно вставлены.');

        await client.query(`
            CREATE TABLE IF NOT EXISTS user_roles (
            user_id INT REFERENCES users(id),
            role_id INT REFERENCES roles(id),
            PRIMARY KEY (user_id, role_id)
            );
            `, []);

        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            manager_id INT REFERENCES users(id),
            droper_id INT REFERENCES users(id), 
            number VARCHAR(39) NOT NULL, 
            fd_rd TEXT NOT NULL,
            cardholder_name TEXT NOT NULL,
            amount  NUMERIC (12,2),
            droper_comment TEXT,
            status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'taken', 'failed', 'done')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW() 
            );
            `, []);

        await client.query(
            `CREATE TABLE IF NOT EXISTS order_screenshots (
            id SERIAL PRIMARY KEY,
            order_id INT REFERENCES orders(id) ON DELETE CASCADE, 
            file_id TEXT NOT NULL, 
            created_at TIMESTAMP
            DEFAULT NOW()
        );
        `, []);

        await client.query(`COMMIT`, []);
        console.log("Таблицы  были успешно созданы.");

    }  catch (err) { 
        await client.query(`ROLLBACK`, []);
        console.error(`Ошибка при создании таблиц: `, err);
        process.exit(1);  
    } finally { 
        client.release();
        pool.end();
    }
})();