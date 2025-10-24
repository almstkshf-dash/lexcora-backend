-- Add VAT columns to invoices table
ALTER TABLE invoices
ADD COLUMN subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER amount,
ADD COLUMN vat_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00 AFTER subtotal,
ADD COLUMN vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER vat_rate;

-- Update existing records to populate subtotal and vat_amount based on current amount
-- Assuming current amount includes VAT (5%)
UPDATE invoices 
SET 
  subtotal = ROUND(amount / 1.05, 2),
  vat_rate = 5.00,
  vat_amount = ROUND(amount - (amount / 1.05), 2)
WHERE vat_amount = 0;
