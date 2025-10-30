// Migration script to add is_pending column to cases table
require('dotenv').config();
const mysql = require('mysql2/promise');

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✅ Connected to database');
    console.log('🔄 Running migration: Add is_pending column...');

    // Check if column already exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'cases' 
      AND COLUMN_NAME = 'is_pending'
    `, [process.env.DB_NAME]);

    if (columns.length > 0) {
      console.log('ℹ️  Column is_pending already exists in cases table');
    } else {
      // Add the column
      await connection.query(`
        ALTER TABLE cases 
        ADD COLUMN is_pending tinyint(1) DEFAULT '0' AFTER is_archived
      `);
      console.log('✅ Successfully added is_pending column to cases table');
    }

    // Update existing records to have default value
    await connection.query(`
      UPDATE cases SET is_pending = 0 WHERE is_pending IS NULL
    `);
    console.log('✅ Updated existing records with default value');

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

runMigration();
