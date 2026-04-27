const mysql = require('mysql2/promise');
require('dotenv').config();

async function describeTables() {
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
    
    let [cases] = await connection.query('DESCRIBE cases');
    console.log('cases:', cases.map(c => c.Field).join(', '));

    let [departments] = await connection.query('DESCRIBE departments');
    console.log('departments:', departments.map(c => c.Field).join(', '));
    
  } catch (error) {
    console.error(error);
  } finally {
    if (connection) await connection.end();
  }
}

describeTables();
