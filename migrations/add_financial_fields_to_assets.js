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
    
    console.log('Checking columns in assets table...');
    const [columns] = await connection.query('DESCRIBE assets');
    const columnNames = columns.map(c => c.Field);

    const columnsToAdd = [
      { name: 'category', definition: "VARCHAR(100) DEFAULT NULL" },
      { name: 'serial_number', definition: "VARCHAR(150) DEFAULT NULL" },
      { name: 'physical_location', definition: "VARCHAR(255) DEFAULT NULL" },
      { name: 'custodian_id', definition: 'INT NULL' },
      { name: 'budget_id', definition: 'INT NULL' },
      { name: 'purchase_cost', definition: 'DECIMAL(15, 2) DEFAULT 0' },
      { name: 'purchase_date', definition: 'DATE NULL' },
      { name: 'account_id', definition: 'INT NULL' },
      { name: 'depreciation_rate', definition: 'DECIMAL(5, 2) DEFAULT 0' },
      { name: 'salvage_value', definition: 'DECIMAL(15, 2) DEFAULT 0' },
      { name: 'current_value', definition: 'DECIMAL(15, 2) DEFAULT 0' }
    ];

    for (const col of columnsToAdd) {
      if (!columnNames.includes(col.name)) {
        console.log(`Adding column ${col.name}...`);
        await connection.query(`ALTER TABLE assets ADD COLUMN ${col.name} ${col.definition}`);
      } else {
        console.log(`Column ${col.name} already exists.`);
      }
    }

    // Add foreign key constraint if it doesn't exist
    const foreignKeys = [
      {
        name: 'fk_asset_account',
        sql: `ALTER TABLE assets ADD CONSTRAINT fk_asset_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL`
      },
      {
        name: 'fk_asset_custodian',
        sql: `ALTER TABLE assets ADD CONSTRAINT fk_asset_custodian FOREIGN KEY (custodian_id) REFERENCES employees(id) ON DELETE SET NULL`
      },
      {
        name: 'fk_asset_budget',
        sql: `ALTER TABLE assets ADD CONSTRAINT fk_asset_budget FOREIGN KEY (budget_id) REFERENCES account_budgets(id) ON DELETE SET NULL`
      }
    ];

    for (const fk of foreignKeys) {
      try {
        console.log(`Adding foreign key ${fk.name}...`);
        await connection.query(fk.sql);
      } catch (fkError) {
        if (fkError.code === 'ER_DUP_CONSTRAINT_NAME' || fkError.code === 'ER_DUP_KEYNAME') {
          console.log(`Foreign key ${fk.name} already exists.`);
        } else {
          console.warn(`Could not add foreign key ${fk.name}: ${fkError.message}`);
        }
      }
    }
    
    console.log('Migration completed successfully.');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
