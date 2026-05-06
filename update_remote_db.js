const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Connected to remote database.');

    // Check columns for invoices
    const [invoiceCols] = await connection.query('SHOW COLUMNS FROM invoices');
    const invoiceColNames = invoiceCols.map(c => c.Field);
    console.log('Invoice columns:', invoiceColNames);

    if (!invoiceColNames.includes('vat_category')) {
      console.log('Adding VAT columns to invoices...');
      await connection.query(`ALTER TABLE invoices 
        ADD COLUMN taxable_amount DECIMAL(15,2) DEFAULT 0.00,
        ADD COLUMN vat_amount DECIMAL(15,2) DEFAULT 0.00,
        ADD COLUMN vat_category ENUM('standard', 'zero_rated', 'exempt', 'out_of_scope') DEFAULT 'standard'`);
      console.log('VAT columns added to invoices.');
    }

    // Check columns for bills
    const [billCols] = await connection.query('SHOW COLUMNS FROM bills');
    const billColNames = billCols.map(c => c.Field);
    console.log('Bill columns:', billColNames);

    if (!billColNames.includes('vat_category')) {
      console.log('Adding VAT columns to bills...');
      await connection.query(`ALTER TABLE bills 
        ADD COLUMN taxable_amount DECIMAL(15,2) DEFAULT 0.00,
        ADD COLUMN vat_amount DECIMAL(15,2) DEFAULT 0.00,
        ADD COLUMN vat_category ENUM('standard', 'zero_rated', 'exempt', 'out_of_scope') DEFAULT 'standard'`);
      console.log('VAT columns added to bills.');
    }

    // Also run SettingsModel.ensureTableExists() just in case
    const SettingsModel = require('./src/models/settingsModel');
    // Need to pass the db connection or let it use the default pool
    await SettingsModel.ensureTableExists();
    console.log('Settings table ensured.');

    await connection.end();
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
