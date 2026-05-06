-- Migration for UAE FTA Compliance
-- Created: 2026-05-06

-- Add TRN to branches (Company TRN)
ALTER TABLE branches ADD COLUMN trn VARCHAR(50);

-- Add TRN to parties (Client/Vendor TRN)
ALTER TABLE parties ADD COLUMN trn VARCHAR(50);

-- Add VAT details to invoices
ALTER TABLE invoices 
ADD COLUMN vat_category ENUM('standard', 'zero_rated', 'exempt', 'out_of_scope') DEFAULT 'standard',
ADD COLUMN taxable_amount DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN vat_amount DECIMAL(15,2) DEFAULT 0.00;

-- Add VAT details to invoice_items
ALTER TABLE invoice_items 
ADD COLUMN vat_rate DECIMAL(5,2) DEFAULT 5.00,
ADD COLUMN vat_amount DECIMAL(15,2) DEFAULT 0.00;

-- Add VAT details to bills (Expenses)
ALTER TABLE bills 
ADD COLUMN vat_category ENUM('standard', 'zero_rated', 'exempt', 'out_of_scope') DEFAULT 'standard',
ADD COLUMN taxable_amount DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN vat_amount DECIMAL(15,2) DEFAULT 0.00;

-- Add VAT details to bill_items
ALTER TABLE bill_items 
ADD COLUMN vat_rate DECIMAL(5,2) DEFAULT 5.00,
ADD COLUMN vat_amount DECIMAL(15,2) DEFAULT 0.00;
