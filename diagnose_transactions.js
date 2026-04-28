require('dotenv').config();
const mysql = require('mysql2/promise');

const test = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('✅ Connected\n');

  try {
    // Test 1: Does projects table exist?
    const [tables] = await connection.query(`SHOW TABLES LIKE 'projects'`);
    console.log('projects table exists:', tables.length > 0);

    // Test 2: Run the exact query from getAllTransactions with type=credit
    const [rows] = await connection.query(`
      SELECT COUNT(*) as total
      FROM employee_cash_transactions ect
      LEFT JOIN employees e ON ect.employee_id = e.id
      WHERE ect.type = ?
    `, ['credit']);
    console.log('Count query OK, total:', rows[0].total);

    // Test 3: Full query
    const [data] = await connection.query(`
      SELECT 
        ect.id, ect.employee_id, ect.client_id, ect.bank_account_id,
        ect.amount, ect.type, ect.description, ect.status,
        ect.case_id, ect.department_id, ect.project_id,
        ect.created_by, ect.created_at,
        e.name as employee_name,
        COALESCE(e.balance, 0) as employee_balance,
        creator.name as created_by_name,
        p.name as client_name,
        ba.bank_name, ba.account_name, ba.account_number,
        c.topic as case_name,
        d.name_ar as department_name,
        proj.name as project_name
      FROM employee_cash_transactions ect
      LEFT JOIN employees e ON ect.employee_id = e.id
      LEFT JOIN employees creator ON ect.created_by = creator.id
      LEFT JOIN parties p ON ect.client_id = p.id
      LEFT JOIN bank_accounts ba ON ect.bank_account_id = ba.id
      LEFT JOIN cases c ON ect.case_id = c.id
      LEFT JOIN departments d ON ect.department_id = d.id
      LEFT JOIN projects proj ON ect.project_id = proj.id
      WHERE ect.type = ?
      ORDER BY ect.created_at DESC
      LIMIT 10 OFFSET 0
    `, ['credit']);
    console.log('Full query OK, rows returned:', data.length);
    console.log('Sample row:', JSON.stringify(data[0], null, 2));

  } catch (err) {
    console.error('❌ Query failed:', err.message);
    console.error('SQL State:', err.sqlState);
    console.error('Error Code:', err.code);
  } finally {
    await connection.end();
  }
};

test();
