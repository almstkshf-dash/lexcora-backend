-- ============================================================
-- Migration: 2026_05_06 — Permissions & Global Settings
-- Run this against any EXISTING database that was deployed
-- before Database.sql was updated on 2026-05-06.
-- Safe to run multiple times (uses INSERT IGNORE / IF NOT EXISTS).
-- ============================================================

-- 1. Ensure global_settings table exists
CREATE TABLE IF NOT EXISTS `global_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_name_ar` VARCHAR(255),
  `company_name_en` VARCHAR(255),
  `company_trn` VARCHAR(50),
  `company_address_ar` TEXT,
  `company_address_en` TEXT,
  `company_phone` VARCHAR(50),
  `company_email` VARCHAR(255),
  `company_logo_url` TEXT,
  `default_vat_rate` DECIMAL(5,2) DEFAULT 5.00,
  `terms_conditions_ar` TEXT,
  `terms_conditions_en` TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Seed default settings if empty
INSERT IGNORE INTO `global_settings` (`id`, `company_name_ar`, `company_name_en`, `default_vat_rate`)
SELECT 1, 'ليكسورا للمحاماة', 'Lexcora Law Firm', 5.00
WHERE NOT EXISTS (SELECT 1 FROM `global_settings` LIMIT 1);

-- ============================================================
-- 3. Add missing permissions (INSERT IGNORE = safe on re-run)
-- ============================================================
INSERT IGNORE INTO `permissions` (`id`, `permission_ar`, `permission_en`, `permission_parent_name`, `permission_group_name`, `created_at`) VALUES
-- Finance: Settings
(300, 'إدارة الإعدادات العامة',           'manage_settings',          'settings', 'general',           '2026-05-06 17:00:00'),
-- Finance: Bank Accounts
(301, 'عرض الحسابات البنكية',              'view_bank_accounts',        'finance',  'bank_accounts',     '2026-05-06 17:00:00'),
(302, 'إدارة الحسابات البنكية',            'manage_bank_accounts',      'finance',  'bank_accounts',     '2026-05-06 17:00:00'),
-- Finance: Invoices
(303, 'عرض الفواتير',                       'view_invoices',             'finance',  'invoices',          '2026-05-06 17:00:00'),
(304, 'إضافة فاتورة',                       'invoice_add',               'finance',  'invoices',          '2026-05-06 17:00:00'),
(305, 'تعديل فاتورة',                       'invoice_edit',              'finance',  'invoices',          '2026-05-06 17:00:00'),
(306, 'حذف فاتورة',                         'invoice_delete',            'finance',  'invoices',          '2026-05-06 17:00:00'),
-- Finance: Ledger / Accounts
(307, 'عرض دفتر الأستاذ',                   'view_accounts',             'finance',  'ledger',            '2026-05-06 17:00:00'),
(308, 'إدارة دفتر الأستاذ',                 'manage_accounts',           'finance',  'ledger',            '2026-05-06 17:00:00'),
-- Finance: Reports
(309, 'عرض التقارير المالية',               'view_financial_reports',    'finance',  'reports',           '2026-05-06 17:00:00'),
(310, 'عرض تقارير ضريبة القيمة المضافة',   'view_vat_reports',          'finance',  'reports',           '2026-05-06 17:00:00'),
-- Finance: Journal Entries
(311, 'عرض القيود المحاسبية',              'view_journal_entries',      'finance',  'journal_entries',   '2026-05-06 17:00:00'),
(312, 'عرض قيد محاسبي',                    'view_journal_entry',        'finance',  'journal_entries',   '2026-05-06 17:00:00'),
(313, 'إنشاء قيد محاسبي',                  'create_journal_entry',      'finance',  'journal_entries',   '2026-05-06 17:00:00'),
-- Finance: Fiscal Periods
(314, 'عرض الفترات المالية',               'view_fiscal_periods',       'finance',  'fiscal_periods',    '2026-05-06 17:00:00'),
(315, 'إدارة الفترات المالية',              'manage_fiscal_periods',     'finance',  'fiscal_periods',    '2026-05-06 17:00:00'),
-- Finance: Budgets
(316, 'عرض الميزانيات',                     'view_budgets',              'finance',  'budgets',           '2026-05-06 17:00:00'),
(317, 'إدارة الميزانيات',                   'manage_budgets',            'finance',  'budgets',           '2026-05-06 17:00:00'),
-- Finance: Petty Cash
(318, 'عرض النثريات',                       'view_petty_cash',           'finance',  'petty_cash',        '2026-05-06 17:00:00'),
(319, 'إدارة النثريات',                     'manage_petty_cash',         'finance',  'petty_cash',        '2026-05-06 17:00:00'),
-- Finance: Assets
(320, 'إدارة الأصول',                       'manage_assets',             'finance',  'assets',            '2026-05-06 17:00:00'),
-- Finance: Employee Statements
(321, 'عرض كشوفات الموظفين',               'view_employee_statements',  'finance',  'employee_statements','2026-05-06 17:00:00'),
-- Security / Settings
(322, 'عرض الأدوار',                        'view_roles',                'settings', 'security',          '2026-05-06 17:00:00'),
(323, 'إدارة الأمان',                       'manage_security',           'settings', 'security',          '2026-05-06 17:00:00'),
(324, 'عرض الصلاحيات',                      'view_permissions',          'settings', 'security',          '2026-05-06 17:00:00'),
(325, 'عرض الفروع',                         'view_branches',             'settings', 'branches',          '2026-05-06 17:00:00'),
(326, 'إدارة الفروع',                       'manage_branches',           'settings', 'branches',          '2026-05-06 17:00:00'),
-- Logs
(327, 'عرض سجلات النشاط',                   'view_logs',                 'settings', 'logs',              '2026-05-06 17:00:00'),
(328, 'إدارة سجلات النشاط',                 'manage_logs',               'settings', 'logs',              '2026-05-06 17:00:00'),
-- Branches
(329, 'إضافة فرع',                           'Add Branch',                'settings', 'branches',          '2026-05-06 18:00:00'),
(330, 'تعديل فرع',                           'Update Branch',             'settings', 'branches',          '2026-05-06 18:00:00'),
(331, 'حذف فرع',                             'Delete Branch',             'settings', 'branches',          '2026-05-06 18:00:00'),
-- HR / Payroll
(332, 'عرض كشوف الرواتب',                    'View Payroll',              'hr',       'payroll',           '2026-05-06 18:00:00'),
(333, 'معالجة الرواتب',                      'Process Payroll',           'hr',       'payroll',           '2026-05-06 18:00:00'),
(334, 'صرف الراتب',                          'Pay Salary',                'hr',       'payroll',           '2026-05-06 18:00:00'),
(335, 'عرض كشف حساب الموظف',                 'View Employee Account Statement', 'hr', 'employee_statements','2026-05-06 18:00:00'),
-- Client Deposits
(336, 'عرض ودائع الموكل',                    'View Client Deposits',      'finance',  'client_deposits',   '2026-05-06 18:00:00'),
(337, 'إضافة وديعة موكل',                    'Add Client Deposit',        'finance',  'client_deposits',   '2026-05-06 18:00:00'),
(338, 'تعديل وديعة موكل',                    'Edit Client Deposit',       'finance',  'client_deposits',   '2026-05-06 18:00:00'),
(339, 'حذف وديعة موكل',                      'Delete Client Deposit',     'finance',  'client_deposits',   '2026-05-06 18:00:00'),
-- Employee Cash Transactions
(340, 'عرض معاملات النقدية للموظف',          'View Employee Cash Transactions',   'finance', 'employee_cash', '2026-05-06 18:00:00'),
(341, 'إضافة معاملة نقدية للموظف',           'Add Employee Cash Transaction',      'finance', 'employee_cash', '2026-05-06 18:00:00'),
(342, 'تعديل معاملة نقدية للموظف',           'Edit Employee Cash Transaction',     'finance', 'employee_cash', '2026-05-06 18:00:00'),
(343, 'حذف معاملة نقدية للموظف',             'Delete Employee Cash Transaction',   'finance', 'employee_cash', '2026-05-06 18:00:00'),
(344, 'حذف مرفق معاملة نقدية',               'Delete Employee Cash Transaction Attachment', 'finance', 'employee_cash', '2026-05-06 18:00:00'),
-- Sessions
(345, 'عرض الجلسات',                         'View Sessions',             'cases',    'sessions',          '2026-05-06 18:00:00');

-- ============================================================
-- Done. Verify with:
-- SELECT id, permission_en, permission_parent_name FROM permissions WHERE id >= 300 ORDER BY id;
-- Expected: 46 rows (IDs 300-345)
-- ============================================================
