require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT)
  });

  console.log('Connected to Railway DB...\n');

  // ── 1. bank_account_id on employee_cash_transactions ──────────────────────
  try {
    await conn.query('ALTER TABLE employee_cash_transactions ADD COLUMN bank_account_id INT DEFAULT NULL AFTER client_id');
    console.log('OK  : Added bank_account_id column to employee_cash_transactions');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('SKIP: bank_account_id already exists');
    else { console.error('FAIL:', e.message); throw e; }
  }

  try {
    await conn.query('ALTER TABLE employee_cash_transactions ADD CONSTRAINT fk_ect_bank_account FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL');
    console.log('OK  : Added FK fk_ect_bank_account');
  } catch (e) {
    if (e.message.includes('Duplicate key name') || e.message.includes('already exists') || e.code === 'ER_DUP_KEY') {
      console.log('SKIP: FK fk_ect_bank_account already exists');
    } else {
      console.log('WARN: FK skipped —', e.message);
    }
  }

  // ── 2. accounts flags ─────────────────────────────────────────────────────
  try {
    await conn.query('ALTER TABLE accounts ADD COLUMN is_reconcilable BOOLEAN DEFAULT FALSE');
    console.log('OK  : Added is_reconcilable to accounts');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('SKIP: is_reconcilable already exists');
    else { console.error('FAIL:', e.message); throw e; }
  }

  try {
    await conn.query('ALTER TABLE accounts ADD COLUMN allow_manual_posting BOOLEAN DEFAULT TRUE');
    console.log('OK  : Added allow_manual_posting to accounts');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('SKIP: allow_manual_posting already exists');
    else { console.error('FAIL:', e.message); throw e; }
  }

  // ── 3. Seed Chart of Accounts ────────────────────────────────────────────
  console.log('\nSeeding Chart of Accounts...');
  const chartOfAccounts = [
    { code: '1000', name_ar: 'الأصول',                    name_en: 'Assets',                   type: 'asset' },
    { code: '1100', name_ar: 'الأصول المتداولة',           name_en: 'Current Assets',            type: 'asset' },
    { code: '1101', name_ar: 'الصندوق',                   name_en: 'Cash on Hand',              type: 'asset' },
    { code: '1102', name_ar: 'البنك',                     name_en: 'Bank Accounts',             type: 'asset' },
    { code: '1103', name_ar: 'الحسابات المدينة',           name_en: 'Accounts Receivable',       type: 'asset' },
    { code: '2000', name_ar: 'الالتزامات',                name_en: 'Liabilities',               type: 'liability' },
    { code: '2100', name_ar: 'الالتزامات المتداولة',       name_en: 'Current Liabilities',       type: 'liability' },
    { code: '2101', name_ar: 'الحسابات الدائنة',           name_en: 'Accounts Payable',          type: 'liability' },
    { code: '3000', name_ar: 'حقوق الملكية',              name_en: 'Equity',                    type: 'equity' },
    { code: '3100', name_ar: 'رأس المال',                 name_en: 'Capital',                   type: 'equity' },
    { code: '4000', name_ar: 'الإيرادات',                 name_en: 'Revenue',                   type: 'revenue' },
    { code: '4100', name_ar: 'إيرادات الخدمات القانونية', name_en: 'Legal Services Revenue',    type: 'revenue' },
    { code: '4101', name_ar: 'إيرادات الاستشارات',        name_en: 'Consultation Revenue',      type: 'revenue' },
    { code: '5000', name_ar: 'المصروفات',                 name_en: 'Expenses',                  type: 'expense' },
    { code: '5100', name_ar: 'المصروفات التشغيلية',       name_en: 'Operating Expenses',        type: 'expense' },
    { code: '5101', name_ar: 'الرواتب والأجور',           name_en: 'Salaries and Wages',        type: 'expense' },
    { code: '5102', name_ar: 'الإيجار',                   name_en: 'Rent',                      type: 'expense' },
    { code: '5103', name_ar: 'الكهرباء والمياه',          name_en: 'Utilities',                 type: 'expense' },
  ];

  for (const a of chartOfAccounts) {
    try {
      await conn.query(
        'INSERT INTO accounts (code, name_ar, name_en, type) VALUES (?,?,?,?)',
        [a.code, a.name_ar, a.name_en, a.type]
      );
      console.log('OK  : Inserted account', a.code, a.name_en);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') console.log('SKIP: account', a.code, 'already exists');
      else { console.error('FAIL:', e.message); throw e; }
    }
  }

  // Set parent_id relationships
  const parentMap = [
    { parent: '1000', like: '11%' },
    { parent: '2000', like: '21%' },
    { parent: '3000', like: '31%' },
    { parent: '4000', like: '41%' },
    { parent: '5000', like: '51%' },
    { parent: '1100', codes: ['1101','1102','1103'] },
    { parent: '4100', codes: ['4101'] },
    { parent: '5100', codes: ['5101','5102','5103'] },
  ];
  for (const pm of parentMap) {
    const [[parentRow]] = await conn.query('SELECT id FROM accounts WHERE code = ?', [pm.parent]);
    if (!parentRow) continue;
    if (pm.like) {
      await conn.query('UPDATE accounts SET parent_id = ? WHERE code LIKE ? AND code != ?', [parentRow.id, pm.like, pm.parent]);
    } else {
      await conn.query('UPDATE accounts SET parent_id = ? WHERE code IN (?)', [parentRow.id, pm.codes]);
    }
  }
  console.log('OK  : Parent relationships set');

  // ── 4. Create + Seed currencies ──────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS currencies (
      code VARCHAR(3) PRIMARY KEY,
      name_ar VARCHAR(100) NOT NULL,
      name_en VARCHAR(100) NOT NULL,
      symbol VARCHAR(10),
      is_base BOOLEAN DEFAULT FALSE,
      exchange_rate DECIMAL(18,6) DEFAULT 1.0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('OK  : currencies table ready');
  console.log('\nSeeding currencies...');
  const currencies = [
    { code: 'AED', name_ar: 'درهم إماراتي', name_en: 'UAE Dirham',   symbol: 'د.إ', is_base: 1, rate: 1.0 },
    { code: 'USD', name_ar: 'دولار أمريكي', name_en: 'US Dollar',    symbol: '$',   is_base: 0, rate: 3.6725 },
    { code: 'SAR', name_ar: 'ريال سعودي',   name_en: 'Saudi Riyal',  symbol: 'ر.س', is_base: 0, rate: 0.98 },
  ];
  for (const c of currencies) {
    try {
      await conn.query(
        'INSERT INTO currencies (code, name_ar, name_en, symbol, is_base, exchange_rate) VALUES (?,?,?,?,?,?)',
        [c.code, c.name_ar, c.name_en, c.symbol, c.is_base, c.rate]
      );
      console.log('OK  : Inserted currency', c.code);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') console.log('SKIP: currency', c.code, 'already exists');
      else { console.error('FAIL:', e.message); throw e; }
    }
  }

  // ── 5. posting_settings seed ──────────────────────────────────────────────
  const [accs] = await conn.query(
    "SELECT id, code FROM accounts WHERE code IN ('1101','1102','1103','2101','4100','5100')"
  );
  const byCode = {};
  accs.forEach(a => { byCode[a.code] = a.id; });
  console.log('\nAccount IDs resolved:', byCode);

  const settings = [
    { event_key: 'INVOICE_CREATED',  debit: byCode['1103'], credit: byCode['4100'], tpl: 'Invoice {invoice_number} for {client_name}' },
    { event_key: 'PAYMENT_RECEIVED', debit: byCode['1102'], credit: byCode['1103'], tpl: 'Payment received for Invoice {invoice_number}' },
    { event_key: 'BILL_RECEIVED',    debit: byCode['5100'], credit: byCode['2101'], tpl: 'Bill {bill_number} from {supplier_name}' },
    { event_key: 'PAYMENT_MADE',     debit: byCode['2101'], credit: byCode['1102'], tpl: 'Payment made to {supplier_name} for Bill {bill_number}' },
    { event_key: 'EXPENSE_PAID',     debit: byCode['5100'], credit: byCode['1101'], tpl: 'Expense paid: {description}' },
  ];

  console.log('');
  for (const s of settings) {
    if (!s.debit || !s.credit) {
      console.log('WARN: Missing account ID for', s.event_key, '— skipping');
      continue;
    }
    try {
      await conn.query(
        'INSERT INTO posting_settings (event_key, debit_account_id, credit_account_id, description_template, is_active) VALUES (?,?,?,?,1)',
        [s.event_key, s.debit, s.credit, s.tpl]
      );
      console.log('OK  : Inserted posting_settings for', s.event_key);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') console.log('SKIP: posting_settings already has row for', s.event_key);
      else { console.error('FAIL:', e.message); throw e; }
    }
  }

  // ── 4. Verify ─────────────────────────────────────────────────────────────
  console.log('\n── Verification ──────────────────────────────────────────────');
  const [ectCols] = await conn.query('SHOW COLUMNS FROM employee_cash_transactions');
  console.log('employee_cash_transactions cols:', ectCols.map(c => c.Field).join(', '));

  const [accCols] = await conn.query('SHOW COLUMNS FROM accounts');
  console.log('accounts cols:', accCols.map(c => c.Field).join(', '));

  const [ps] = await conn.query('SELECT event_key, debit_account_id, credit_account_id, is_active FROM posting_settings');
  console.log('posting_settings rows:');
  ps.forEach(r => console.log(' ', r.event_key, '| debit:', r.debit_account_id, '| credit:', r.credit_account_id, '| active:', r.is_active));

  await conn.end();
  console.log('\nAll migrations complete.');
}

migrate().catch(e => { console.error('\nFATAL:', e.message); process.exit(1); });
