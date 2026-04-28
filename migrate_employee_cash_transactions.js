require('dotenv').config();
const mysql = require('mysql2/promise');

const migrate = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('✅ Connected to database:', process.env.DB_HOST);

  try {
    // 1. Create projects table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ projects table ready');

    // 2. Check existing columns
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'employee_cash_transactions'
    `);
    const existing = columns.map(c => c.COLUMN_NAME);
    console.log('Existing columns:', existing.join(', '));

    const toAdd = [];
    if (!existing.includes('bank_account_id')) toAdd.push('ADD COLUMN bank_account_id INT DEFAULT NULL AFTER client_id');
    if (!existing.includes('case_id'))         toAdd.push('ADD COLUMN case_id INT DEFAULT NULL');
    if (!existing.includes('department_id'))   toAdd.push('ADD COLUMN department_id INT DEFAULT NULL');
    if (!existing.includes('project_id'))      toAdd.push('ADD COLUMN project_id INT DEFAULT NULL');

    if (toAdd.length > 0) {
      await connection.query(`ALTER TABLE employee_cash_transactions ${toAdd.join(', ')}`);
      console.log('✓ Added columns:', toAdd.map(s => s.split(' ')[3]).join(', '));
    } else {
      console.log('✓ All columns already exist — nothing to add');
    }

    console.log('\n🎉 Migration completed successfully!');
  } finally {
    await connection.end();
  }
};

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
