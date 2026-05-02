/**
 * Assets → Finance Integration Migration
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const DB = {
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     parseInt(process.env.DB_PORT) || 3306,
};

async function runQuery(conn, label, sql, params = []) {
  try {
    const [result] = await conn.query(sql, params);
    console.log(`  ✅ ${label}`);
    return result;
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY' || e.code === 'ER_DUP_KEYNAME' || e.message.includes('Duplicate')) {
      console.log(`  ⏭  ${label} — already exists`);
    } else {
      console.warn(`  ⚠️  ${label} — ${e.message.substring(0, 120)}`);
    }
  }
}

async function run() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL || DB);
  console.log('✅ Connected to:', DB.database, '\n');

  // 1. Seed Asset Accounts
  console.log('💰 Step 1: Seeding Asset Accounts...');
  const accounts = [
    ['1201', 'معدات مكتبية',            'Office Equipment',            'asset'],
    ['1202', 'أجهزة كمبيوتر',           'Computer Hardware',           'asset'],
    ['1203', 'أثاث وتجهيزات',           'Furniture & Fixtures',         'asset'],
    ['1204', 'مركبات',                 'Vehicles',                    'asset'],
    ['1205', 'مجمع الاستهلاك',           'Accumulated Depreciation',     'asset'],
    ['5130', 'مصروف الاستهلاك',         'Depreciation Expense',        'expense'],
    ['5131', 'أرباح/خسائر بيع أصول',    'Gain/Loss on Asset Disposal', 'expense'],
  ];

  for (const [code, name_ar, name_en, type] of accounts) {
    await runQuery(conn, `Account ${code} - ${name_en}`,
      `INSERT IGNORE INTO accounts (code, name_ar, name_en, type, is_active, allow_manual_posting)
       VALUES (?, ?, ?, ?, 1, 1)`,
      [code, name_ar, name_en, type]);
  }

  // Get account IDs for posting settings
  const [accRows] = await conn.query('SELECT id, code FROM accounts');
  const accountMap = {};
  accRows.forEach(r => accountMap[r.code] = r.id);

  // 2. Seed Posting Settings
  console.log('\n⚙️ Step 2: Seeding Asset Posting Settings...');
  const settings = [
    ['ASSET_PURCHASE', accountMap['1201'] || 1, accountMap['1102'] || 4, 'Purchase of asset: {name}'],
    ['ASSET_DEPRECIATION', accountMap['5130'], accountMap['1205'], 'Monthly depreciation for {name}'],
    ['ASSET_DISPOSAL', accountMap['5131'], accountMap['1201'] || 1, 'Disposal of asset: {name}'],
  ];

  for (const [event, debit, credit, template] of settings) {
    if (debit && credit) {
        await runQuery(conn, `Posting Setting: ${event}`,
        `INSERT IGNORE INTO posting_settings (event_key, debit_account_id, credit_account_id, description_template, is_active)
            VALUES (?, ?, ?, ?, 1)`,
        [event, debit, credit, template]);
    }
  }

  await conn.end();
  console.log('\n🎉 Assets → Finance integration migration complete!');
}

run().catch(e => { console.error('❌ Fatal:', e.message); process.exit(1); });
