"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});
exports.pool.on(`error`, (err, client) => {
    console.error(`Неожиданная ошибка пула базы данных.`, err);
    process.exit(-1);
});
const query = async (text, params) => {
    return exports.pool.query(text, params);
};
exports.query = query;
console.log(`Пулы в базу данных инциализированы успешно.`);
(async () => {
    try {
        await exports.pool.query(`SELECT 1`);
        console.log("Пул подключен к базе данных.");
    }
    catch (err) {
        console.error(`ОШтбка при подкдючении:`, err);
        process.exit(1);
    }
})();
