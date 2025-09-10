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

pool.on(`error`, (err: any , client:any) => {
    console.error(`Неожиданная ошибка пула базы данных.`, err)
    process.exit(-1);
})

export  const query = async(text: string, params: any[]) => { 
    return pool.query(text, params);
}

console.log(`Пулы в базу данных инциализированы успешно.`);


(async () => {
    try {
        await pool.query(`SELECT 1`); 
        console.log("Пул подключен к базе данных.");
    } catch (err) { 
        console.error(`ОШтбка при подкдючении:` ,err)
        process.exit(1);
    }
})();
