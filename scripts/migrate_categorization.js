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
    
    if (process.env.DATABASE_URL) {
      connection = await mysql.createConnection(process.env.DATABASE_URL);
    } else {
      connection = await mysql.createConnection(config);
    }

    console.log("Connected to database. Starting migration...");

    const tablesToUpdate = ['invoices', 'bills', 'ledger_entries', 'invoice_items', 'bill_items'];
    const columnsToAdd = [
      { name: 'case_id', type: 'INT DEFAULT NULL' },
      { name: 'project_id', type: 'INT DEFAULT NULL' },
      { name: 'department_id', type: 'INT DEFAULT NULL' }
    ];

    for (const table of tablesToUpdate) {
      for (const col of columnsToAdd) {
        try {
          await connection.query(`ALTER TABLE ${table} ADD COLUMN ${col.name} ${col.type}`);
          console.log(`Added ${col.name} to ${table}`);
        } catch (e) {
          if (e.code === 'ER_DUP_FIELDNAME') console.log(`${col.name} already exists in ${table}`);
          else console.error(`Error adding ${col.name} to ${table}:`, e.message);
        }
      }
    }

    // Create expense_allocation_rules table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expense_allocation_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Created expense_allocation_rules table");

    // Create expense_allocation_rule_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expense_allocation_rule_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        rule_id INT NOT NULL,
        case_id INT DEFAULT NULL,
        project_id INT DEFAULT NULL,
        department_id INT DEFAULT NULL,
        percentage DECIMAL(5, 2) NOT NULL,
        FOREIGN KEY (rule_id) REFERENCES expense_allocation_rules(id) ON DELETE CASCADE
      )
    `);
    console.log("Created expense_allocation_rule_items table");

    // Create transaction_allocations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transaction_allocations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        source_type ENUM('bill', 'employee_cash_transaction', 'invoice') NOT NULL,
        source_id INT NOT NULL,
        case_id INT DEFAULT NULL,
        project_id INT DEFAULT NULL,
        department_id INT DEFAULT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        percentage DECIMAL(5, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Created transaction_allocations table");

    console.log("Migration completed successfully.");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrate();
