const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const [rows] = await connection.query("SHOW TABLES;");
    console.log("Tables in database:", rows.map(r => Object.values(r)[0]));
  } catch (err) {
    console.error("Error checking tables:", err.message);
  } finally {
    await connection.end();
  }
}

checkTables();
