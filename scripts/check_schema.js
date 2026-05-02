
require('dotenv').config();
const db = require('../src/config/db');

async function checkSchema() {
  try {
    console.log('Checking meetings table schema...');
    const [meetingsColumns] = await db.query('DESCRIBE meetings');
    console.log('Meetings columns:', meetingsColumns.map(c => c.Field));

    console.log('\nChecking employees table schema...');
    const [employeesColumns] = await db.query('DESCRIBE employees');
    console.log('Employees columns:', employeesColumns.map(c => c.Field));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSchema();
