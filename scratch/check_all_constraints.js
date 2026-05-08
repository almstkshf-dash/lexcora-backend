const db = require("../src/config/db");
require('dotenv').config();

async function checkAllFKs() {
  try {
    const [rows] = await db.query(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'journal_entries'
    `);
    
    console.log("All Constraints for journal_entries:", rows);
  } catch (error) {
    console.error("Failed to check constraints:", error.message);
  } finally {
    process.exit();
  }
}

checkAllFKs();
