const db = require("../src/config/db");
require('dotenv').config();

async function checkLedgerEntriesCollation() {
  try {
    console.log(`\nCollations for table: ledger_entries`);
    const [cols] = await db.query(`
      SELECT COLUMN_NAME, COLLATION_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'ledger_entries'
    `);
    
    cols.forEach(col => {
      if (col.COLLATION_NAME) {
        console.log(`${col.COLUMN_NAME}: ${col.COLLATION_NAME}`);
      }
    });
  } catch (error) {
    console.error("Failed to check collations:", error.message);
  } finally {
    process.exit();
  }
}

checkLedgerEntriesCollation();
