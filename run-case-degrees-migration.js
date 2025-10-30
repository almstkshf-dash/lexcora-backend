// Migration script to add client_status and opponent_status columns to case_degrees table
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
    console.log('🔄 Running migration: Add client_status and opponent_status columns...');

    // Check if client_status column already exists
    const [clientStatusColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'case_degrees' 
      AND COLUMN_NAME = 'client_status'
    `, [process.env.DB_NAME]);

    if (clientStatusColumns.length > 0) {
      console.log('ℹ️  Column client_status already exists in case_degrees table');
    } else {
      // Add the client_status column
      await connection.query(`
        ALTER TABLE case_degrees 
        ADD COLUMN client_status VARCHAR(255) DEFAULT NULL AFTER referral_date
      `);
      console.log('✅ Successfully added client_status column to case_degrees table');
    }

    // Check if opponent_status column already exists
    const [opponentStatusColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'case_degrees' 
      AND COLUMN_NAME = 'opponent_status'
    `, [process.env.DB_NAME]);

    if (opponentStatusColumns.length > 0) {
      console.log('ℹ️  Column opponent_status already exists in case_degrees table');
    } else {
      // Add the opponent_status column
      await connection.query(`
        ALTER TABLE case_degrees 
        ADD COLUMN opponent_status VARCHAR(255) DEFAULT NULL AFTER client_status
      `);
      console.log('✅ Successfully added opponent_status column to case_degrees table');
    }

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

runMigration();
