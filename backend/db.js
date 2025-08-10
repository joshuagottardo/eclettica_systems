import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Percorso assoluto di questa cartella
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carica .env da questa cartella
dotenv.config({ path: `${__dirname}/.env` });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
