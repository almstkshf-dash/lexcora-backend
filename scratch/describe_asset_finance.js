const mysql = require('mysql2/promise');
require('dotenv').config();

async function describeTable(tableName) {
  let connection;
  try {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lexcora',
      port: process.env.DB_PORT || 3306,
    };
    connection = await mysql.createConnection(process.env.DATABASE_URL || config);
    
    let [columns] = await connection.query(`DESCRIBE ${tableName}`);
    console.log(`${tableName} columns:`, columns.map(c => `${c.Field} (${c.Type})`).join(', '));
    
  } catch (error) {
    console.error(`Error describing ${tableName}:`, error.message);
  } finally {
    if (connection) await connection.end();
  }
}

async function main() {
  await describeTable('assets');
  await describeTable('accounts');
  await describeTable('journal_entries');
}

main();
