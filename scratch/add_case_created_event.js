
require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('Adding CASE_CREATED to posting_settings...');
    
    await db.query(`
      INSERT IGNORE INTO posting_settings (event_key, debit_account_id, credit_account_id, description_template)
      VALUES (
        'CASE_CREATED', 
        (SELECT id FROM accounts WHERE code = '1103'), 
        (SELECT id FROM accounts WHERE code = '4100'),
        'Quoted fees for Case {case_number} - {file_number}'
      )
    `);
    
    console.log('Migration successful!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
