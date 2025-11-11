const db = require('./src/config/db');

const addBankAccountColumn = async () => {
  try {
    console.log('Starting migration: Adding bank_account_id column to employee_cash_transactions table...');
    
    // Check if column already exists
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'employee_cash_transactions' 
      AND COLUMN_NAME = 'bank_account_id'
    `);
    
    if (columns.length > 0) {
      console.log('Column bank_account_id already exists in employee_cash_transactions table.');
      return;
    }
    
    // Add the bank_account_id column
    await db.query(`
      ALTER TABLE employee_cash_transactions 
      ADD COLUMN bank_account_id INT DEFAULT NULL AFTER client_id,
      ADD CONSTRAINT fk_employee_cash_transactions_bank_account 
      FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) 
      ON DELETE SET NULL
    `);
    
    console.log('Successfully added bank_account_id column to employee_cash_transactions table.');
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await db.end();
  }
};

// Run the migration
addBankAccountColumn()
  .then(() => {
    console.log('Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
