-- Accounting Refinement and Enhancement Migration
-- Created: 2026-04-27

-- 1. Enhance Ledger Entries for Multi-currency & Consolidation
ALTER TABLE ledger_entries 
ADD COLUMN base_debit DECIMAL(18, 2) DEFAULT 0.00 AFTER debit,
ADD COLUMN base_credit DECIMAL(18, 2) DEFAULT 0.00 AFTER credit;

-- 2. Enhance Accounts with validation flags
ALTER TABLE accounts
ADD COLUMN is_reconcilable BOOLEAN DEFAULT FALSE,
ADD COLUMN allow_manual_posting BOOLEAN DEFAULT TRUE;

-- 3. Create Posting Settings table for dynamic automated posting
CREATE TABLE IF NOT EXISTS posting_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_key VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'INVOICE_CREATED'
    debit_account_id INT,
    credit_account_id INT,
    description_template TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (debit_account_id) REFERENCES accounts(id),
    FOREIGN KEY (credit_account_id) REFERENCES accounts(id)
);

-- Seed Posting Settings
INSERT IGNORE INTO posting_settings (event_key, debit_account_id, credit_account_id, description_template)
SELECT 'INVOICE_CREATED', 
    (SELECT id FROM accounts WHERE code = '1103'), 
    (SELECT id FROM accounts WHERE code = '4100'),
    'Invoice {invoice_number} for {client_name}'
UNION ALL
SELECT 'PAYMENT_RECEIVED', 
    (SELECT id FROM accounts WHERE code = '1102'), 
    (SELECT id FROM accounts WHERE code = '1103'),
    'Payment received for Invoice {invoice_number}'
UNION ALL
SELECT 'BILL_RECEIVED', 
    (SELECT id FROM accounts WHERE code = '5100'), 
    (SELECT id FROM accounts WHERE code = '2101'),
    'Bill {bill_number} from {supplier_name}'
UNION ALL
SELECT 'PAYMENT_MADE', 
    (SELECT id FROM accounts WHERE code = '2101'), 
    (SELECT id FROM accounts WHERE code = '1102'),
    'Payment made to {supplier_name} for Bill {bill_number}'
UNION ALL
SELECT 'EXPENSE_PAID', 
    (SELECT id FROM accounts WHERE code = '5100'), 
    (SELECT id FROM accounts WHERE code = '1102'),
    'Expense paid: {expense_category}';
