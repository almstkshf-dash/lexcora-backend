/**
 * Centralized permission keys to avoid scattering literal strings across routes.
 * Keys should align with the `permissions.permission_en` values stored in DB.
 */
const PERMISSIONS = {
  branches: {
    create: 'Add Branch',
    update: 'Update Branch',
    delete: 'Delete Branch',
  },
  caseClassifications: {
    create: 'Add Case Classification',
    delete: 'Delete Case Classification',
  },
  caseTypes: {
    create: 'Add Case Type',
    delete: 'Delete Case Type',
  },
  cases: {
    list: 'Show Cases',
    search: 'Search Cases',
    view: 'View Case',
    create: 'Add Case',
    addParty: 'Add Case Parties',
    deleteParty: 'Delete Case Parties',
    viewParties: 'View Case Parties',
  },
  clientsDeals: {
    list: 'View  Deals',
    listByClient: 'View Clients Deals',
    view: 'View Deal',
    create: 'Add Deal',
    update: 'Edit Deal',
    delete: 'Delete Deal',
  },
  employees: {
    list: 'View Employee',
    view: 'View Employee',
    create: 'Add Employee',
    update: 'Edit Employee',
    delete: 'Delete Employee',
    accountStatement: 'View Employee Account Statement',
  },
  invoices: {
    list: 'view_invoices',
    create: 'invoice_add',
    update: 'invoice_edit',
    delete: 'invoice_delete',
  },
  memos: {
    create: 'Add Memo',
    update: 'Edit Memo',
    delete: 'Delete Memo',
  },
  parties: {
    list: 'View Parties',
    view: 'View Party',
    create: 'Add Party',
    update: 'Edit Party',
    delete: 'Delete Party',
  },
  partiesOrders: {
    list: 'View Parties Orders',
    view: 'View Party Order',
    create: 'Add Party Order',
    update: 'Edit Party Order',
    delete: 'Delete Party Order',
  },
  sessions: {
    list: 'View Sessions',
    create: 'Add Session',
    update: 'Edit Session',
    delete: 'Delete Session',
  },
  tasks: {
    create: 'Add Task',
    update: 'Edit Task',
    delete: 'Delete Task',
  },
  clientsDeposits: {
    view: 'View Client Deposits',
    create: 'Add Client Deposit',
    update: 'Edit Client Deposit',
    delete: 'Delete Client Deposit',
  },
  employeeCashTransactions: {
    view: 'View Employee Cash Transactions',
    create: 'Add Employee Cash Transaction',
    update: 'Edit Employee Cash Transaction',
    delete: 'Delete Employee Cash Transaction',
    deleteAttachment: 'Delete Employee Cash Transaction Attachment',
  },
  payroll: {
    view: 'View Payroll',
    process: 'Process Payroll',
    pay: 'Pay Salary',
  },
};

/**
 * Helper to resolve a permission key safely.
 */
const permission = (resource, action) => {
  const value = PERMISSIONS?.[resource]?.[action];
  if (!value) {
    throw new Error(`Permission not found for ${resource}.${action}`);
  }
  return value;
};

module.exports = {
  PERMISSIONS,
  permission,
};
