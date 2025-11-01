-- Migration: Update Invoices Structure
-- Date: 2025-01-01
-- Description: 
--   1. Add branch_id to invoices table
--   2. Add status ENUM (pending, approved) to invoices table  
--   3. Add vat field to invoices table
--   4. Remove referred_by_employee_id from invoices table
--   5. Remove bank_account_id from invoices table
--   6. Create invoice_attachments table with invoice_id foreign key

-- Step 1: Add new columns to invoices table
ALTER TABLE invoices
ADD COLUMN branch_id INT NULL,
ADD COLUMN status ENUM('pending', 'approved') DEFAULT 'pending',
ADD COLUMN vat DECIMAL(5,2) DEFAULT 0,
ADD COLUMN currency VARCHAR(10) DEFAULT 'AED';

-- Step 2: Add foreign key for branch_id
ALTER TABLE invoices
ADD CONSTRAINT fk_invoices_branch
FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;

-- Step 3: Drop old columns (optional - do this after data migration if needed)
-- Uncomment these lines once you've migrated any important data
-- ALTER TABLE invoices DROP COLUMN referred_by_employee_id;
-- ALTER TABLE invoices DROP COLUMN bank_account_id;

-- Step 4: Create invoice_attachments table with invoice_id
CREATE TABLE IF NOT EXISTS invoice_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    attachment_url VARCHAR(255) NOT NULL,
    attachment_name VARCHAR(100) NOT NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL
);

-- Step 5: Create index for better query performance
CREATE INDEX idx_invoice_attachments_invoice_id ON invoice_attachments(invoice_id);
CREATE INDEX idx_invoices_branch_id ON invoices(branch_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Note: After running this migration:
-- 1. Update all existing invoices to set appropriate branch_id values
-- 2. Update status from old values (draft/issued/paid/cancelled) to new values (pending/approved) if needed
-- 3. After data migration, uncomment and run the DROP COLUMN statements above
