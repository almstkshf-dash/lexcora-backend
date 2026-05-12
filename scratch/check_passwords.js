require('dotenv').config();
const db = require('../src/config/db');

async function checkPasswords() {
  try {
    const [rows] = await db.query('SELECT id, username, password FROM employees');
    console.log('Employees and Passwords:');
    rows.forEach(row => {
      const isHashed = row.password && (row.password.startsWith('$2a$') || row.password.startsWith('$2b$'));
      console.log(`ID: ${row.id}, Username: ${row.username}, Password: ${row.password.substring(0, 10)}..., IsHashed: ${isHashed}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkPasswords();
