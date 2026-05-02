/**
 * HR → Finance Integration Migration
 * Safe for all MySQL versions (no IF NOT EXISTS on ALTER TABLE)
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const DB = {
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     parseInt(process.env.DB_PORT) || 3306,
  connectTimeout: 60000
};

// ── helpers ──────────────────────────────────────────────────────
async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) as cnt FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
    [DB.database, table, column]
  );
  return rows[0].cnt > 0;
}

async function indexExists(conn, table, indexName) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) as cnt FROM information_schema.statistics
     WHERE table_schema = ? AND table_name = ? AND index_name = ?`,
    [DB.database, table, indexName]
  );
  return rows[0].cnt > 0;
}

async function addColumn(conn, table, column, definition) {
  if (await columnExists(conn, table, column)) {
    console.log(`  ⏭  Column '${column}' already exists — skipped`);
    return;
  }
  await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  console.log(`  ✅ Added column '${column}'`);
}

async function runQuery(conn, label, sql) {
  try {
    await conn.query(sql);
    console.log(`  ✅ ${label}`);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY' || e.code === 'ER_DUP_KEYNAME' || e.message.includes('Duplicate')) {
      console.log(`  ⏭  ${label} — already exists`);
    } else {
      console.warn(`  ⚠️  ${label} — ${e.message.substring(0, 120)}`);
    }
  }
}

// ── main ──────────────────────────────────────────────────────────
async function run() {
  const conn = await mysql.createConnection(DB);
  console.log('✅ Connected to:', DB.database, '\n');

  // ── STEP 1: Add columns to employee_requests ──
  console.log('📋 Step 1: Extending employee_requests table...');
  const T = 'employee_requests';
  await addColumn(conn, T, 'leave_pay_type',     "ENUM('paid','unpaid','partial') DEFAULT 'paid' COMMENT 'UAE Labor Law pay type'");
  await addColumn(conn, T, 'days_count',          "DECIMAL(6,2) DEFAULT 0 COMMENT 'Calendar days of leave'");
  await addColumn(conn, T, 'daily_rate',          "DECIMAL(12,2) DEFAULT 0.00 COMMENT 'AED per calendar day'");
  await addColumn(conn, T, 'leave_value_aed',     "DECIMAL(14,2) DEFAULT 0.00 COMMENT 'Total financial value'");
  await addColumn(conn, T, 'account_id',          "INT DEFAULT NULL COMMENT 'FK accounts.id debit'");
  await addColumn(conn, T, 'contra_account_id',   "INT DEFAULT NULL COMMENT 'FK accounts.id credit'");
  await addColumn(conn, T, 'journal_entry_id',    "INT DEFAULT NULL COMMENT 'FK journal_entries.id'");
  await addColumn(conn, T, 'finance_approval',    "ENUM('pending','approved','rejected') DEFAULT 'pending' COMMENT 'Finance dept sign-off'");
  await addColumn(conn, T, 'finance_notes',       "TEXT DEFAULT NULL");
  await addColumn(conn, T, 'finance_approved_by', "INT DEFAULT NULL COMMENT 'FK employees.id'");
  await addColumn(conn, T, 'finance_approved_at', "DATETIME DEFAULT NULL");
  await addColumn(conn, T, 'reason',              "TEXT DEFAULT NULL COMMENT 'Reason for request'");
  await addColumn(conn, T, 'notes',               "TEXT DEFAULT NULL COMMENT 'Additional notes'");

  // ── STEP 2: Foreign key constraints ──
  console.log('\n🔗 Step 2: Adding FK constraints...');
  await runQuery(conn, 'FK account_id → accounts',
    `ALTER TABLE employee_requests ADD CONSTRAINT fk_er_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL`);
  await runQuery(conn, 'FK contra_account_id → accounts',
    `ALTER TABLE employee_requests ADD CONSTRAINT fk_er_contra_account FOREIGN KEY (contra_account_id) REFERENCES accounts(id) ON DELETE SET NULL`);
  await runQuery(conn, 'FK journal_entry_id → journal_entries',
    `ALTER TABLE employee_requests ADD CONSTRAINT fk_er_journal_entry FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE SET NULL`);
  await runQuery(conn, 'FK finance_approved_by → employees',
    `ALTER TABLE employee_requests ADD CONSTRAINT fk_er_finance_by FOREIGN KEY (finance_approved_by) REFERENCES employees(id) ON DELETE SET NULL`);

  // ── STEP 3: Seed Chart of Accounts ──
  console.log('\n💰 Step 3: Seeding UAE Labour Law Chart of Accounts...');
  const accounts = [
    ['5101', 'مصاريف الإجازة السنوية',          'Annual Leave Expense',              'expense'],
    ['5102', 'مصاريف الإجازة المرضية',          'Sick Leave Expense',                'expense'],
    ['5103', 'مصاريف إجازة الأمومة والوضع',     'Maternity/Paternity Leave Expense', 'expense'],
    ['5104', 'مصاريف إجازة الحداد',              'Mourning Leave Expense',            'expense'],
    ['5105', 'مصاريف إجازة الخدمة الوطنية',     'National Service Leave Expense',    'expense'],
    ['5106', 'مصاريف إجازة الحج والعمرة',       'Hajj & Umrah Leave Expense',        'expense'],
    ['5110', 'مصاريف بدل الإجازة السنوية',      'Annual Leave Allowance Expense',    'expense'],
    ['5120', 'مصاريف نهاية الخدمة (EOE)',        'End of Service Benefit Expense',    'expense'],
    ['2200', 'مخصص الإجازات المدفوعة',           'Accrued Paid Leave Liability',      'liability'],
    ['2201', 'مخصص إجازة سنوية - التزام',        'Annual Leave Accrual - Liability',  'liability'],
    ['2202', 'ذمم دائنة - موظفون',               'Payroll Payable - Employees',       'liability'],
    ['2210', 'مخصص نهاية الخدمة',                'End of Service Benefit Accrual',    'liability'],
  ];
  for (const [code, name_ar, name_en, type] of accounts) {
    await runQuery(conn, `Account ${code} - ${name_en}`,
      `INSERT IGNORE INTO accounts (code, name_ar, name_en, type, is_active, allow_manual_posting)
       VALUES ('${code}', '${name_ar}', '${name_en}', '${type}', 1, 1)`);
  }

  // ── STEP 4: Seed permissions ──
  console.log('\n🔐 Step 4: Seeding HR-Finance permissions...');
  const permissions = [
    ['تعديل قيمة الإجازة المدفوعة',    'Edit Paid Leave Value',            'HR',      'Employee Requests'],
    ['تعديل قيمة الإجازة غير المدفوعة','Edit Unpaid Leave Value',          'HR',      'Employee Requests'],
    ['تعديل نوع دفع الإجازة',           'Edit Leave Pay Type',              'HR',      'Employee Requests'],
    ['موافقة الشؤون المالية على الطلب', 'Finance Approve HR Request',       'Finance', 'Employee Requests'],
    ['إنشاء قيد يومية من طلب HR',       'Create Journal from HR Request',   'Finance', 'Employee Requests'],
    ['عرض التكلفة المالية للطلبات',     'View HR Request Financial Cost',   'Finance', 'Employee Requests'],
    ['رفض الموافقة المالية على الطلب',  'Reject HR Finance Approval',       'Finance', 'Employee Requests'],
  ];
  for (const [ar, en, group, parent] of permissions) {
    await runQuery(conn, `Permission: ${en}`,
      `INSERT IGNORE INTO permissions (permission_ar, permission_en, permission_group_name, permission_parent_name)
       VALUES ('${ar}', '${en}', '${group}', '${parent}')`);
  }

  // ── STEP 5: Indexes ──
  console.log('\n📇 Step 5: Creating indexes...');
  for (const [idx, col] of [
    ['idx_er_finance_approval', 'finance_approval'],
    ['idx_er_account_id',       'account_id'],
    ['idx_er_journal_entry_id', 'journal_entry_id'],
  ]) {
    if (await indexExists(conn, T, idx)) {
      console.log(`  ⏭  Index '${idx}' already exists — skipped`);
    } else if (await columnExists(conn, T, col)) {
      await conn.query(`CREATE INDEX ${idx} ON employee_requests(${col})`);
      console.log(`  ✅ Index '${idx}' created`);
    } else {
      console.log(`  ⚠️  Column '${col}' missing — index skipped`);
    }
  }

  await conn.end();
  console.log('\n🎉 HR → Finance integration migration complete!');
}

run().catch(e => { console.error('❌ Fatal:', e.message); process.exit(1); });
