const mysql = require('mysql2/promise');
require('dotenv').config();

async function createProjectsTable() {
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
    
    await connection.query('CREATE TABLE IF NOT EXISTS projects (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
    console.log('Projects table created successfully');
    
  } catch (error) {
    console.error(error);
  } finally {
    if (connection) await connection.end();
  }
}

createProjectsTable();
