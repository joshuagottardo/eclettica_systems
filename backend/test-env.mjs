import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// carica .env dallo stesso folder del file
dotenv.config({ path: `${__dirname}/.env` });

console.log(process.env.DB_HOST, !!process.env.DB_PASSWORD);