const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
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
    
    console.log('Creating fiscal_periods table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fiscal_periods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('open', 'closed') DEFAULT 'open',
        branch_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INT
      )
    `);

    console.log('Creating account_budgets table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS account_budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        account_id INT NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        fiscal_year INT NOT NULL,
        fiscal_month INT, -- NULL means annual budget
        branch_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (account_id) REFERENCES accounts(id)
      )
    `);

    console.log('Migration completed successfully.');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
