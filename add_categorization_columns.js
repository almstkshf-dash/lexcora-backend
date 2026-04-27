const mysql = require('mysql2/promise');
require('dotenv').config();

async function addCategorizationColumns() {
  let connection;
  try {
    // Determine connection config from env variables
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lexcora',
      port: process.env.DB_PORT || 3306,
    };
    
    // Check if Aiven URL is provided
    if (process.env.DATABASE_URL) {
      connection = await mysql.createConnection(process.env.DATABASE_URL);
    } else {
      connection = await mysql.createConnection(config);
    }

    console.log("Connected to database. Adding columns...");

    // Add case_id
    try {
      await connection.query('ALTER TABLE employee_cash_transactions ADD COLUMN case_id INT DEFAULT NULL');
      console.log('Added case_id column');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('case_id already exists');
      else throw e;
    }

    // Add department_id
    try {
      await connection.query('ALTER TABLE employee_cash_transactions ADD COLUMN department_id INT DEFAULT NULL');
      console.log('Added department_id column');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('department_id already exists');
      else throw e;
    }

    // Add project_id
    try {
      await connection.query('ALTER TABLE employee_cash_transactions ADD COLUMN project_id INT DEFAULT NULL');
      console.log('Added project_id column');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('project_id already exists');
      else throw e;
    }

    console.log("Migration completed successfully.");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addCategorizationColumns();
