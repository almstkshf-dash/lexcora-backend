// Quick script to run the migration
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    console.log('Connected to database...');
    
  const migrationFile = path.join(__dirname, 'migrations', '20251103_add_permission_parent_name_and_hr_permissions.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('Running migration...');
    console.log(sql);
    
    await connection.query(sql);
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await connection.end();
  }
}

runMigration();
