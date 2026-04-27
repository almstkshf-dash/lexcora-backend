const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
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
    
    for (const table of ['invoices', 'bills']) {
      let [columns] = await connection.query(`DESCRIBE ${table}`);
      console.log(`${table}:`);
      columns.forEach(c => {
        console.log(`  ${c.Field}: ${c.Type}`);
      });
    }
    
  } catch (error) {
    console.error(error);
  } finally {
    if (connection) await connection.end();
  }
}

checkSchema();
