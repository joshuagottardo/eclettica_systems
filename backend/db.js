import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'trentin-nas.synology.me',
  user: 'dbuser',
  password: 'AccessorI2025!',
  database: 'eclettica_systems',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
