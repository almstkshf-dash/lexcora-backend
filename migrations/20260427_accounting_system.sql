-- Accounting System Migration
-- Created: 2026-04-27

-- Chart of Accounts
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    type ENUM('asset', 'liability', 'equity', 'revenue', 'expense') NOT NULL,
    parent_id INT,
    branch_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- Currencies
CREATE TABLE IF NOT EXISTS currencies (
    code VARCHAR(3) PRIMARY KEY, -- ISO Code (e.g., AED, USD)
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    is_base BOOLEAN DEFAULT FALSE,
    exchange_rate DECIMAL(18, 6) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entry_date DATE NOT NULL,
    reference_number VARCHAR(50) UNIQUE,
    description TEXT,
    currency_code VARCHAR(3),
    exchange_rate DECIMAL(18, 6) DEFAULT 1.0,
    status ENUM('draft', 'posted', 'cancelled') DEFAULT 'draft',
    created_by INT,
    branch_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (currency_code) REFERENCES currencies(code),
    FOREIGN KEY (created_by) REFERENCES employees(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Ledger Entries (Journal Items)
CREATE TABLE IF NOT EXISTS ledger_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    journal_entry_id INT NOT NULL,
    account_id INT NOT NULL,
    party_id INT, -- Link to client/supplier
    employee_id INT, -- Link to employee (for payroll/expenses)
    description TEXT,
    debit DECIMAL(18, 2) DEFAULT 0.00,
    credit DECIMAL(18, 2) DEFAULT 0.00,
    branch_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (party_id) REFERENCES parties(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Default Currencies
INSERT IGNORE INTO currencies (code, name_ar, name_en, symbol, is_base, exchange_rate) VALUES 
('AED', 'درهم إماراتي', 'UAE Dirham', 'د.إ', TRUE, 1.0),
('USD', 'دولار أمريكي', 'US Dollar', '$', FALSE, 3.6725),
('SAR', 'ريال سعودي', 'Saudi Riyal', 'ر.س', FALSE, 0.98);

-- Basic Chart of Accounts Seed
INSERT IGNORE INTO accounts (code, name_ar, name_en, type) VALUES 
('1000', 'الأصول', 'Assets', 'asset'),
('1100', 'الأصول المتداولة', 'Current Assets', 'asset'),
('1101', 'الصندوق', 'Cash on Hand', 'asset'),
('1102', 'البنك', 'Bank Accounts', 'asset'),
('1103', 'الحسابات المدينة', 'Accounts Receivable', 'asset'),
('2000', 'الالتزامات', 'Liabilities', 'liability'),
('2100', 'الالتزامات المتداولة', 'Current Liabilities', 'liability'),
('2101', 'الحسابات الدائنة', 'Accounts Payable', 'liability'),
('3000', 'حقوق الملكية', 'Equity', 'equity'),
('3100', 'رأس المال', 'Capital', 'equity'),
('4000', 'الإيرادات', 'Revenue', 'revenue'),
('4100', 'إيرادات الخدمات القانونية', 'Legal Services Revenue', 'revenue'),
('4101', 'إيرادات الاستشارات', 'Consultation Revenue', 'revenue'),
('5000', 'المصروفات', 'Expenses', 'expense'),
('5100', 'المصروفات التشغيلية', 'Operating Expenses', 'expense'),
('5101', 'الرواتب والأجور', 'Salaries and Wages', 'expense'),
('5102', 'الإيجار', 'Rent', 'expense'),
('5103', 'الكهرباء والمياه', 'Utilities', 'expense');

-- Set parents for the seed data
UPDATE accounts SET parent_id = (SELECT id FROM (SELECT id FROM accounts WHERE code = '1000') as t) WHERE code LIKE '11%';
UPDATE accounts SET parent_id = (SELECT id FROM (SELECT id FROM accounts WHERE code = '2000') as t) WHERE code LIKE '21%';
UPDATE accounts SET parent_id = (SELECT id FROM (SELECT id FROM accounts WHERE code = '3000') as t) WHERE code LIKE '31%';
UPDATE accounts SET parent_id = (SELECT id FROM (SELECT id FROM accounts WHERE code = '4000') as t) WHERE code LIKE '41%';
UPDATE accounts SET parent_id = (SELECT id FROM (SELECT id FROM accounts WHERE code = '5000') as t) WHERE code LIKE '51%';
UPDATE accounts SET parent_id = (SELECT id FROM (SELECT id FROM accounts WHERE code = '1100') as t) WHERE code IN ('1101', '1102', '1103');
UPDATE accounts SET parent_id = (SELECT id FROM (SELECT id FROM accounts WHERE code = '4100') as t) WHERE code IN ('4101');
UPDATE accounts SET parent_id = (SELECT id FROM (SELECT id FROM accounts WHERE code = '5100') as t) WHERE code IN ('5101', '5102', '5103');
