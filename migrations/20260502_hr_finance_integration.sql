-- ============================================================
-- Migration: HR → Finance Integration
-- Date: 2026-05-02
-- Desc: Links employee requests (leaves & others) to the
--       Chart of Accounts via journal entries, enforces
--       UAE Labor Law pay calculations, and gates value
--       editing behind fine-grained permissions.
-- ============================================================

-- 1. Extend employee_requests table
ALTER TABLE employee_requests
  ADD COLUMN IF NOT EXISTS `leave_pay_type`    ENUM('paid','unpaid','partial') DEFAULT 'paid'     COMMENT 'UAE Labor Law: paid / unpaid / partial',
  ADD COLUMN IF NOT EXISTS `days_count`        DECIMAL(6,2)   DEFAULT 0        COMMENT 'Calendar days of leave',
  ADD COLUMN IF NOT EXISTS `daily_rate`        DECIMAL(12,2)  DEFAULT 0.00     COMMENT 'AED per calendar day (auto-derived from salary or editable)',
  ADD COLUMN IF NOT EXISTS `leave_value_aed`   DECIMAL(14,2)  DEFAULT 0.00     COMMENT 'Total financial value = daily_rate × days_count',
  ADD COLUMN IF NOT EXISTS `account_id`        INT            DEFAULT NULL      COMMENT 'FK → accounts.id (debit account)',
  ADD COLUMN IF NOT EXISTS `contra_account_id` INT            DEFAULT NULL      COMMENT 'FK → accounts.id (credit / liability account)',
  ADD COLUMN IF NOT EXISTS `journal_entry_id`  INT            DEFAULT NULL      COMMENT 'FK → journal_entries.id',
  ADD COLUMN IF NOT EXISTS `finance_approval`  ENUM('pending','approved','rejected') DEFAULT 'pending' COMMENT 'Finance dept sign-off',
  ADD COLUMN IF NOT EXISTS `finance_notes`     TEXT           DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `finance_approved_by` INT          DEFAULT NULL      COMMENT 'FK → employees.id',
  ADD COLUMN IF NOT EXISTS `finance_approved_at` DATETIME     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `reason`            TEXT           DEFAULT NULL      COMMENT 'Reason / justification for the request',
  ADD COLUMN IF NOT EXISTS `notes`             TEXT           DEFAULT NULL      COMMENT 'Additional notes';

-- Add FK constraints (safe — skip if already exist)
ALTER TABLE employee_requests
  ADD CONSTRAINT fk_er_account         FOREIGN KEY IF NOT EXISTS (account_id)         REFERENCES accounts(id)        ON DELETE SET NULL,
  ADD CONSTRAINT fk_er_contra_account  FOREIGN KEY IF NOT EXISTS (contra_account_id)  REFERENCES accounts(id)        ON DELETE SET NULL,
  ADD CONSTRAINT fk_er_journal_entry   FOREIGN KEY IF NOT EXISTS (journal_entry_id)   REFERENCES journal_entries(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_er_finance_by      FOREIGN KEY IF NOT EXISTS (finance_approved_by) REFERENCES employees(id)      ON DELETE SET NULL;

-- 2. Seed UAE Labor Law Chart-of-Accounts entries (idempotent)
INSERT IGNORE INTO accounts (code, name_ar, name_en, type, is_active, allow_manual_posting)
VALUES
  ('5100', 'مصاريف الموظفين - الرواتب',          'Employee Expenses - Salaries',            'expense', 1, 1),
  ('5101', 'مصاريف الإجازة السنوية',               'Annual Leave Expense',                    'expense', 1, 1),
  ('5102', 'مصاريف الإجازة المرضية',               'Sick Leave Expense',                      'expense', 1, 1),
  ('5103', 'مصاريف إجازة الأمومة والوضع',          'Maternity/Paternity Leave Expense',       'expense', 1, 1),
  ('5104', 'مصاريف إجازة الحداد',                  'Mourning Leave Expense',                  'expense', 1, 1),
  ('5105', 'مصاريف إجازة الخدمة الوطنية',          'National Service Leave Expense',          'expense', 1, 1),
  ('5106', 'مصاريف إجازة الحج والعمرة',            'Hajj & Umrah Leave Expense',              'expense', 1, 1),
  ('5110', 'مصاريف بدل الإجازة السنوية',           'Annual Leave Allowance Expense',          'expense', 1, 1),
  ('5120', 'مصاريف نهاية الخدمة (EOE)',            'End of Service Benefit Expense',          'expense', 1, 1),
  ('2200', 'مخصص الإجازات المدفوعة',               'Accrued Paid Leave Liability',            'liability', 1, 1),
  ('2201', 'مخصص إجازة سنوية - التزام',            'Annual Leave Accrual - Liability',        'liability', 1, 1),
  ('2202', 'ذمم دائنة - رواتب الموظفين',            'Payroll Payable - Employees',             'liability', 1, 1),
  ('2210', 'مخصص نهاية الخدمة',                    'End of Service Benefit Accrual',          'liability', 1, 1);

-- 3. Seed HR-Finance permissions (idempotent via IGNORE)
INSERT IGNORE INTO permissions (permission_ar, permission_en, permission_group_name, permission_parent_name)
VALUES
  -- HR module — leave value editing
  ('تعديل قيمة الإجازة المدفوعة',   'Edit Paid Leave Value',      'HR',      'Employee Requests'),
  ('تعديل قيمة الإجازة غير المدفوعة','Edit Unpaid Leave Value',   'HR',      'Employee Requests'),
  ('تعديل نوع دفع الإجازة',          'Edit Leave Pay Type',        'HR',      'Employee Requests'),
  -- Finance module — journal generation and approval
  ('موافقة الشؤون المالية على الطلب', 'Finance Approve HR Request', 'Finance', 'Employee Requests'),
  ('إنشاء قيد يومية من طلب HR',       'Create Journal from HR Request','Finance','Employee Requests'),
  ('عرض التكلفة المالية للطلبات',     'View HR Request Financial Cost','Finance','Employee Requests'),
  ('رفع موافقة الشؤون المالية',       'Reject HR Finance Approval', 'Finance', 'Employee Requests');

-- 4. Index for faster lookups (use plain CREATE INDEX — runner skips ER_DUP_KEYNAME)
CREATE INDEX idx_er_finance_approval ON employee_requests(finance_approval);
CREATE INDEX idx_er_account_id       ON employee_requests(account_id);
CREATE INDEX idx_er_journal_entry_id ON employee_requests(journal_entry_id);
