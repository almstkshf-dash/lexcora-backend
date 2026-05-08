const db = require("../src/config/db");
require('dotenv').config();

async function checkFKName() {
  try {
    const [rows] = await db.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'journal_entries' 
      AND COLUMN_NAME = 'currency_code'
    `);
    
    console.log("FK Names for journal_entries.currency_code:", rows);
  } catch (error) {
    console.error("Failed to check FK name:", error.message);
  } finally {
    process.exit();
  }
}

checkFKName();
