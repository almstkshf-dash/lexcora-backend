const mysql = require('mysql2/promise');
require('dotenv').config();

async function describeFinanceTables() {
  let connection;
  try {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lexcora',
      port: process.env.DB_PORT || 3306,
    };
    connection = await mysql.createConnection(process.env.DATABASE_URL || config);

    const tables = ['accounts', 'journal_entries', 'ledger_entries', 'posting_settings', 'bank_accounts', 'petty_cash', 'invoices', 'payments'];

    for (const table of tables) {
      try {
        let [cols] = await connection.query(`DESCRIBE ${table}`);
        console.log(`${table}:`, cols.map(c => `${c.Field} (${c.Type})`).join(', '));
      } catch (e) {
        console.log(`${table}: Table not found or error: ${e.message}`);
      }
    }

  } catch (error) {
    console.error(error);
  } finally {
    if (connection) await connection.end();
  }
}

describeFinanceTables();
