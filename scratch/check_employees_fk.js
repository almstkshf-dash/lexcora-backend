require('dotenv').config();
const db = require('../src/config/db');

async function checkFK() {
  try {
    console.log('Checking foreign key constraints referencing employees table...');
    const [rows] = await db.query(`
      SELECT 
        TABLE_NAME, 
        COLUMN_NAME, 
        CONSTRAINT_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_NAME = 'employees'
      AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'railway']);
    
    console.log('Constraints found:');
    console.table(rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking constraints:', error);
    process.exit(1);
  }
}

checkFK();
