const db = require("../src/config/db");
require('dotenv').config();

async function testQuery() {
  const query = `
    SELECT je.*, c.name_en as currency_name, e.name as creator_name, b.name_en as branch_name
    FROM journal_entries je
    LEFT JOIN currencies c ON je.currency_code = c.code
    LEFT JOIN employees e ON je.created_by = e.id
    LEFT JOIN branches b ON je.branch_id = b.id
    WHERE 1=1
    ORDER BY je.entry_date DESC, je.id DESC
  `;
  
  try {
    console.log("Running query...");
    const [rows] = await db.query(query, []);
    console.log("Query successful, fetched", rows.length, "rows");
  } catch (error) {
    console.error("Query failed!");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    if (error.sql) console.error("SQL:", error.sql);
  } finally {
    process.exit();
  }
}

testQuery();
