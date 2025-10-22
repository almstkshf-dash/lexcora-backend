-- Migration: Add case_id column to wallet_deposits table
-- Date: October 20, 2025
-- Description: Adds case_id column with foreign key to cases table

-- Check if column already exists before adding it
ALTER TABLE wallet_deposits
ADD COLUMN IF NOT EXISTS case_id INT NULL AFTER client_id;

-- Add foreign key constraint if it doesn't exist
ALTER TABLE wallet_deposits
ADD CONSTRAINT fk_wallet_deposits_case_id
FOREIGN KEY (case_id) REFERENCES cases(id) 
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Verify the changes
DESCRIBE wallet_deposits;

-- Optional: Check existing data
SELECT 
    COUNT(*) as total_deposits,
    COUNT(case_id) as deposits_with_case,
    COUNT(*) - COUNT(case_id) as deposits_without_case
FROM wallet_deposits;
