const fs = require('fs');
const sql = fs.readFileSync('src/config/Database.sql', 'utf8');

const toCheck = [
  // Branches
  'Add Branch', 'Update Branch', 'Delete Branch',
  // Payroll
  'View Payroll', 'Process Payroll', 'Pay Salary',
  // Employees
  'View Employee', 'Add Employee', 'Edit Employee', 'Delete Employee',
  'View Employee Account Statement',
  // Client Deposits
  'View Client Deposits', 'Add Client Deposit', 'Edit Client Deposit', 'Delete Client Deposit',
  // Employee Cash Transactions
  'View Employee Cash Transactions', 'Add Employee Cash Transaction',
  'Edit Employee Cash Transaction', 'Delete Employee Cash Transaction',
  'Delete Employee Cash Transaction Attachment',
  // Sessions / Cases / Parties
  'View Sessions', 'View Case', 'Show Cases', 'View Parties',
  // Invoice permissions (new style)
  'view_invoices', 'invoice_add', 'invoice_edit', 'invoice_delete',
  // Finance
  'manage_settings', 'view_accounts', 'manage_accounts',
  'view_financial_reports', 'view_vat_reports',
  'view_journal_entries', 'view_fiscal_periods', 'manage_fiscal_periods',
  'view_budgets', 'manage_budgets', 'view_petty_cash',
  // Security
  'view_roles', 'manage_security', 'view_permissions',
  'view_branches', 'view_logs',
];

console.log('\n=== Permission DB Alignment Audit ===\n');
const missing = [];
toCheck.forEach(p => {
  const found = sql.indexOf(p) !== -1;
  if (!found) {
    missing.push(p);
    console.log('MISS', p);
  } else {
    console.log('OK  ', p);
  }
});

console.log('\n--- Summary ---');
console.log(`OK: ${toCheck.length - missing.length}  MISSING: ${missing.length}`);
if (missing.length > 0) {
  console.log('\nMissing permissions:');
  missing.forEach(p => console.log(' -', p));
}
