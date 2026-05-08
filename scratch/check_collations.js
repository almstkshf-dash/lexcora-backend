const db = require("../src/config/db");
require('dotenv').config();

async function checkCollations() {
  const tables = ['journal_entries', 'currencies', 'employees', 'branches'];
  
  try {
    for (const table of tables) {
      console.log(`\nCollations for table: ${table}`);
      const [cols] = await db.query(`
        SELECT COLUMN_NAME, COLLATION_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = ?
      `, [table]);
      
      cols.forEach(col => {
        if (col.COLLATION_NAME) {
          console.log(`${col.COLUMN_NAME}: ${col.COLLATION_NAME}`);
        }
      });
    }
  } catch (error) {
    console.error("Failed to check collations:", error.message);
  } finally {
    process.exit();
  }
}

checkCollations();
