require('dotenv').config();
const db = require('../src/config/db');
const { hashPassword } = require('../src/utils/passwordUtils');

async function migratePasswords() {
  try {
    console.log('Starting password migration...');

    // 0. Alter tables to increase password column length
    console.log('Altering tables to increase password column length...');
    await db.query('ALTER TABLE employees MODIFY COLUMN password VARCHAR(255)');
    await db.query('ALTER TABLE parties MODIFY COLUMN password VARCHAR(255)');
    console.log('Table schema updated successfully.');

    // 1. Migrate Employees
    console.log('Migrating employee passwords...');
    const [employees] = await db.query('SELECT id, password FROM employees');
    console.log(`Found ${employees.length} employees.`);

    for (const employee of employees) {
      // Check if already hashed (bcrypt hashes start with $2)
      if (employee.password && employee.password.startsWith('$2')) {
        console.log(`Employee ID ${employee.id} password already hashed, skipping.`);
        continue;
      }

      const hashedPassword = await hashPassword(employee.password || '123456');
      await db.query('UPDATE employees SET password = ? WHERE id = ?', [hashedPassword, employee.id]);
      console.log(`Hashed password for employee ID ${employee.id}.`);
    }

    // 2. Migrate Parties
    console.log('Migrating party passwords...');
    const [parties] = await db.query('SELECT id, password FROM parties');
    console.log(`Found ${parties.length} parties.`);

    for (const party of parties) {
      // Check if already hashed
      if (party.password && party.password.startsWith('$2')) {
        console.log(`Party ID ${party.id} password already hashed, skipping.`);
        continue;
      }

      const hashedPassword = await hashPassword(party.password || '123456');
      await db.query('UPDATE parties SET password = ? WHERE id = ?', [hashedPassword, party.id]);
      console.log(`Hashed password for party ID ${party.id}.`);
    }

    console.log('Password migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migratePasswords();
