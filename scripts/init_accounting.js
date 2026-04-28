const mysql = require('mysql2/promise');
require('dotenv').config();

async function initAccounting() {
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

    console.log("Connected to database. Initializing accounting tables...");

    // 1. Accounts Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name_ar VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NOT NULL,
        type ENUM('asset', 'liability', 'equity', 'revenue', 'expense') NOT NULL,
        parent_id INT DEFAULT NULL,
        branch_id INT DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Created accounts table");

    // 2. Journal Entries Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        entry_date DATE NOT NULL,
        reference_number VARCHAR(100),
        description TEXT,
        currency_code VARCHAR(10) DEFAULT 'AED',
        exchange_rate DECIMAL(15, 6) DEFAULT 1.0,
        status ENUM('draft', 'posted', 'void') DEFAULT 'draft',
        created_by INT,
        branch_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Created journal_entries table");

    // 3. Ledger Entries Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ledger_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        journal_entry_id INT NOT NULL,
        account_id INT NOT NULL,
        party_id INT DEFAULT NULL,
        employee_id INT DEFAULT NULL,
        case_id INT DEFAULT NULL,
        project_id INT DEFAULT NULL,
        department_id INT DEFAULT NULL,
        description TEXT,
        debit DECIMAL(15, 2) DEFAULT 0,
        base_debit DECIMAL(15, 2) DEFAULT 0,
        credit DECIMAL(15, 2) DEFAULT 0,
        base_credit DECIMAL(15, 2) DEFAULT 0,
        branch_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id)
      )
    `);
    console.log("Created ledger_entries table");

    // 4. Posting Settings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS posting_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_key VARCHAR(100) UNIQUE NOT NULL,
        debit_account_id INT NOT NULL,
        credit_account_id INT NOT NULL,
        description_template TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (debit_account_id) REFERENCES accounts(id),
        FOREIGN KEY (credit_account_id) REFERENCES accounts(id)
      )
    `);
    console.log("Created posting_settings table");

    console.log("Accounting tables initialized successfully.");

  } catch (error) {
    console.error("Initialization failed:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initAccounting();
