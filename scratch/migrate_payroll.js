const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  let connection;
  try {
    const config = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    };
    connection = await mysql.createConnection(process.env.DATABASE_URL || config);
    
    console.log('Adding accounts...');
    const accounts = [
      { code: '5104', name_en: 'Employee Allowances', name_ar: 'بدلات الموظفين', parent_id: 15, account_type: 'expense' },
      { code: '5105', name_en: 'Employee Bonuses & Incentives', name_ar: 'مكافآت وحوافز الموظفين', parent_id: 15, account_type: 'expense' },
      { code: '5106', name_en: 'End of Service Expense', name_ar: 'مصروف نهاية الخدمة', parent_id: 15, account_type: 'expense' },
      { code: '2102', name_en: 'Accrued Salaries & Wages', name_ar: 'رواتب وأجور مستحقة', parent_id: 7, account_type: 'liability' },
      { code: '2103', name_en: 'EOS Provision', name_ar: 'مخصص نهاية الخدمة', parent_id: 7, account_type: 'liability' },
    ];

    for (const acc of accounts) {
        const [exists] = await connection.query('SELECT id FROM accounts WHERE code = ?', [acc.code]);
        if (exists.length === 0) {
            await connection.query('INSERT INTO accounts (code, name_en, name_ar, parent_id, type) VALUES (?, ?, ?, ?, ?)', 
                [acc.code, acc.name_en, acc.name_ar, acc.parent_id, acc.account_type]);
            console.log(`Account ${acc.code} added.`);
        }
    }

    console.log('Updating salaries table schema...');
    const columnsToAdd = [
      { name: 'incentives', type: 'decimal(10,2) DEFAULT 0.00' },
      { name: 'bonuses', type: 'decimal(10,2) DEFAULT 0.00' },
      { name: 'eos_amount', type: 'decimal(10,2) DEFAULT 0.00' },
      { name: 'housing_allowance', type: 'decimal(10,2) DEFAULT 0.00' },
      { name: 'transportation_allowance', type: 'decimal(10,2) DEFAULT 0.00' },
      { name: 'other_allowance', type: 'decimal(10,2) DEFAULT 0.00' },
    ];

    for (const col of columnsToAdd) {
        const [columns] = await connection.query(`SHOW COLUMNS FROM salaries LIKE ?`, [col.name]);
        if (columns.length === 0) {
            await connection.query(`ALTER TABLE salaries ADD COLUMN ${col.name} ${col.type} AFTER allowances`);
            console.log(`Column ${col.name} added to salaries.`);
        }
    }

    console.log('Adding posting settings...');
    const [salaryExpense] = await connection.query('SELECT id FROM accounts WHERE code = "5101"');
    const [salaryPayable] = await connection.query('SELECT id FROM accounts WHERE code = "2102"');
    const [cashAccount] = await connection.query('SELECT id FROM accounts WHERE code = "1000"'); // Usually Cash or Bank

    if (salaryExpense.length && salaryPayable.length) {
        const settings = [
            { 
                event_key: 'SALARY_PROCESSED', 
                debit_account_id: salaryExpense[0].id, 
                credit_account_id: salaryPayable[0].id, 
                description_template: 'Salary processed for {employee_name} - {pay_period}' 
            },
            { 
                event_key: 'SALARY_PAID', 
                debit_account_id: salaryPayable[0].id, 
                credit_account_id: 4, // Default Cash/Bank account ID from earlier check (PAYMENT_MADE used 4)
                description_template: 'Salary paid to {employee_name} - {pay_period}' 
            }
        ];

        for (const s of settings) {
            const [exists] = await connection.query('SELECT id FROM posting_settings WHERE event_key = ?', [s.event_key]);
            if (exists.length === 0) {
                await connection.query('INSERT INTO posting_settings (event_key, debit_account_id, credit_account_id, description_template) VALUES (?, ?, ?, ?)', 
                    [s.event_key, s.debit_account_id, s.credit_account_id, s.description_template]);
                console.log(`Posting setting ${s.event_key} added.`);
            }
        }
    }

    console.log('Migration completed.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
