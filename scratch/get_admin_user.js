require('dotenv').config();
const db = require('../src/config/db');

(async () => {
  try {
    const [rows] = await db.query(`
      SELECT e.id, e.username, e.name, e.status, r.role_en as role
      FROM employees e
      LEFT JOIN roles r ON e.role_id = r.id
      WHERE e.status = 'active'
      ORDER BY e.id ASC
      LIMIT 10
    `);
    console.log('\n=== Active Employees (for Bruno test credentials) ===');
    rows.forEach(r => {
      console.log(`ID: ${r.id} | username: ${r.username} | name: ${r.name} | role: ${r.role}`);
    });
    console.log('\nUse one of these usernames in local.bru → adminUsername');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
