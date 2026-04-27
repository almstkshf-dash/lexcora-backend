-- Migration: AR/AP Enhancements and Fixes
-- Created: 2026-04-27

-- 1. Fix Invoice Status Enum
ALTER TABLE invoices MODIFY COLUMN status ENUM('pending', 'partially_paid', 'paid', 'cancelled', 'approved', 'rejected') DEFAULT 'pending';

-- 2. Create Bills Table (if missing)
CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_date DATE NOT NULL,
    bill_number VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    vendor_id INT,
    branch_id INT,
    bank_account_id INT,
    status ENUM('pending', 'partially_paid', 'paid', 'cancelled', 'approved', 'rejected') DEFAULT 'pending',
    currency VARCHAR(10) DEFAULT 'AED',
    vat DECIMAL(5, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (vendor_id) REFERENCES parties(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id),
    FOREIGN KEY (created_by) REFERENCES employees(id)
);

-- 3. Create Bill Items Table
CREATE TABLE IF NOT EXISTS bill_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    description TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);

-- 4. Create Bill Attachments Table
CREATE TABLE IF NOT EXISTS bill_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    attachment_url VARCHAR(1000) NOT NULL,
    attachment_name VARCHAR(255),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES employees(id)
);

-- 5. Add Payments table if missing (it was used in paymentsModel but not in show_tables!)
-- Wait, let me check show_tables again.
-- ... 'parties', 'parties_documents', 'parties_forms', 'parties_orders', 'permissions', 'petty_cash_funds', 'petty_cash_transactions' ...
-- I don't see 'payments' in the list!
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'cheque', 'credit_card', 'other') NOT NULL,
    reference_number VARCHAR(100),
    invoice_id INT,
    bill_id INT,
    party_id INT NOT NULL,
    bank_account_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE SET NULL,
    FOREIGN KEY (party_id) REFERENCES parties(id),
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id),
    FOREIGN KEY (created_by) REFERENCES employees(id)
);
