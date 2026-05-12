require('dotenv').config();
const db = require('../src/config/db');

async function forceDeleteAllEmployees() {
  try {
    console.log('Starting forceful deletion of employees (except admin)...');
    
    // Admin ID to keep
    const adminIdToKeep = 73; // ID of منتصر محمد سالم

    // 1. Disable FK checks temporarily to allow deleting employees with constraints
    // Warning: This leaves orphaned records in other tables. This is usually only okay for a complete reset.
    // A better approach for a partial reset is to delete the dependent records first.
    
    // Let's delete dependent records from the most common tables first to avoid massive orphans
    console.log('Deleting related records...');
    const tablesWithEmployeeId = [
        'employee_requests', 'logs', 'sessions', 'tasks', 'invoices',
        'employee_cash_transactions', 'employee_permissions', 'event_attendance',
        'meeting_attendance', 'leaves', 'other_leaves', 'sick_leaves',
        'salaries', 'reviews', 'warnings', 'trainings'
    ];

    for (const table of tablesWithEmployeeId) {
        try {
            await db.query(`DELETE FROM ${table} WHERE employee_id != ? OR employee_id IS NULL`, [adminIdToKeep]);
            console.log(`Cleared non-admin records from ${table}`);
        } catch (e) {
            // Ignore if column doesn't exist or table doesn't exist
        }
    }
    
    // Now disable FK checks to delete the employees themselves (and any other missed dependencies)
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    
    console.log('Deleting employees...');
    const [result] = await db.query('DELETE FROM employees WHERE id != ?', [adminIdToKeep]);
    
    console.log(`Deleted ${result.affectedRows} employees.`);
    
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Force deletion complete. Database referential integrity re-enabled.');
    process.exit(0);
  } catch (error) {
    console.error('Force delete failed:', error);
    process.exit(1);
  }
}

forceDeleteAllEmployees();
