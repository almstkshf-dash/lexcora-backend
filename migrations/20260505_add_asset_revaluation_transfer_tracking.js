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

    const [columns] = await connection.query('DESCRIBE assets');
    const existing = columns.map(c => c.Field);

    const columnsToAdd = [
      { name: 'status', definition: "VARCHAR(32) NOT NULL DEFAULT 'active'" },
      { name: 'disposal_date', definition: 'DATE NULL' },
      { name: 'disposal_value', definition: 'DECIMAL(15, 2) DEFAULT 0' },
      { name: 'disposal_reason', definition: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'last_revaluation_date', definition: 'DATE NULL' },
      { name: 'last_revaluation_reason', definition: 'VARCHAR(255) DEFAULT NULL' }
    ];

    for (const col of columnsToAdd) {
      if (!existing.includes(col.name)) {
        console.log(`Adding column ${col.name} to assets...`);
        await connection.query(`ALTER TABLE assets ADD COLUMN ${col.name} ${col.definition}`);
      } else {
        console.log(`Column ${col.name} already exists.`);
      }
    }

    console.log('Creating asset_transfers table if needed...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS asset_transfers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        asset_id INT NOT NULL,
        from_branch_id INT NULL,
        to_branch_id INT NULL,
        from_custodian_id INT NULL,
        to_custodian_id INT NULL,
        transfer_date DATE NOT NULL,
        reason VARCHAR(255) NULL,
        note TEXT NULL,
        created_by INT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_asset_transfers_asset_id (asset_id),
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Creating asset_revaluations table if needed...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS asset_revaluations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        asset_id INT NOT NULL,
        previous_value DECIMAL(15, 2) NOT NULL,
        new_value DECIMAL(15, 2) NOT NULL,
        change_amount DECIMAL(15, 2) NOT NULL,
        revaluation_date DATE NOT NULL,
        reason VARCHAR(255) NULL,
        note TEXT NULL,
        created_by INT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_asset_revaluations_asset_id (asset_id),
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
