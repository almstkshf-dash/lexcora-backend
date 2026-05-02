const mysql = require('mysql2/promise');
require('dotenv').config();

async function describeTable() {
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
    
    let [cols] = await connection.query('DESCRIBE posting_settings');
    console.log('posting_settings:', JSON.stringify(cols, null, 2));
    
  } catch (error) {
    console.error(error);
  } finally {
    if (connection) await connection.end();
  }
}

describeTable();
