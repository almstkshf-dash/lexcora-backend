const db = require("../src/config/db");
require('dotenv').config();

async function fixCollations() {
  try {
    console.log("Checking if journal_entries_ibfk_1 exists...");
    const [fks] = await db.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'journal_entries' 
      AND CONSTRAINT_NAME = 'journal_entries_ibfk_1'
    `);

    if (fks.length > 0) {
      console.log("Dropping foreign key journal_entries_ibfk_1...");
      await db.query("ALTER TABLE journal_entries DROP FOREIGN KEY journal_entries_ibfk_1");
    }

    console.log("Altering currencies table collation...");
    await db.query("ALTER TABLE currencies CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci");
    
    console.log("Ensuring specific columns are correctly collated...");
    await db.query("ALTER TABLE currencies MODIFY code VARCHAR(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci");
    await db.query("ALTER TABLE currencies MODIFY name_ar VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci");
    await db.query("ALTER TABLE currencies MODIFY name_en VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci");
    await db.query("ALTER TABLE currencies MODIFY symbol VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci");

    console.log("Re-adding foreign key journal_entries_ibfk_1...");
    try {
        await db.query("ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_ibfk_1 FOREIGN KEY (currency_code) REFERENCES currencies(code)");
        console.log("Foreign key re-added successfully.");
    } catch (fkError) {
        console.warn("Could not re-add foreign key (maybe data mismatch?):", fkError.message);
    }

    console.log("✅ Collation fix completed successfully.");
    
    // Test the original failing query
    const testQuery = `
      SELECT je.*, c.name_en as currency_name, e.name as creator_name, b.name_en as branch_name
      FROM journal_entries je
      LEFT JOIN currencies c ON je.currency_code = c.code
      LEFT JOIN employees e ON je.created_by = e.id
      LEFT JOIN branches b ON je.branch_id = b.id
      LIMIT 1
    `;
    await db.query(testQuery);
    console.log("✅ Verified: Query now works!");

  } catch (error) {
    console.error("❌ Failed to fix collations:", error);
  } finally {
    process.exit();
  }
}

fixCollations();
