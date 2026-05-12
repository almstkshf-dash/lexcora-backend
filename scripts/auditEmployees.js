require('dotenv').config();
const db = require('../src/config/db');

async function auditEmployees() {
  try {
    console.log('Auditing employees and their related records...');
    
    const [employees] = await db.query('SELECT id, name, username FROM employees');
    console.log(`Found ${employees.length} employees.`);

    const tablesToCheck = [
      'tasks', 'cases', 'invoices', 'parties', 'logs', 
      'employee_requests', 'salaries', 'leaves', 'attendance'
    ];

    for (const emp of employees) {
      console.log(`\nEmployee: ${emp.name} (ID: ${emp.id})`);
      for (const table of tablesToCheck) {
        try {
          // Check if column exists first
          const [cols] = await db.query(`SHOW COLUMNS FROM ${table} LIKE 'employee_id'`);
          const column = cols.length > 0 ? 'employee_id' : (table === 'tasks' ? 'assigned_to' : (table === 'logs' ? 'employee_id' : null));
          
          if (!column) continue;

          const [countResult] = await db.query(`SELECT COUNT(*) as count FROM ${table} WHERE ${column} = ?`, [emp.id]);
          if (countResult[0].count > 0) {
            console.log(` - ${table}: ${countResult[0].count} records`);
          }
        } catch (e) {
          // Table might not exist or column different
        }
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
  }
}

auditEmployees();
