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
    console.log('Checking assets table schema...');

    const [columns] = await connection.query('DESCRIBE assets');
    const columnNames = columns.map((column) => column.Field);

    const columnsToAdd = [
      {
        name: 'depreciation_method',
        definition: "VARCHAR(40) NOT NULL DEFAULT 'straight_line'"
      },
      {
        name: 'useful_life',
        definition: 'INT DEFAULT 5'
      }
    ];

    for (const column of columnsToAdd) {
      if (!columnNames.includes(column.name)) {
        console.log(`Adding column ${column.name}...`);
        await connection.query(`ALTER TABLE assets ADD COLUMN ${column.name} ${column.definition}`);
      } else {
        console.log(`Column ${column.name} already exists.`);
      }
    }

    console.log('Depreciation fields migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
