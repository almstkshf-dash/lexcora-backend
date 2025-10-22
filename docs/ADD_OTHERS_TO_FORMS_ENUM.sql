-- Migration: Add 'others' to forms document_for ENUM
-- Date: 2025-01-XX
-- Description: Adds 'others' value to the document_for ENUM in the forms table

-- Step 1: Check current ENUM values
-- SHOW COLUMNS FROM forms WHERE Field = 'document_for';

-- Step 2: Modify the ENUM to add 'others'
ALTER TABLE forms 
MODIFY COLUMN document_for ENUM(
  'early leave',
  'car acknowledgement letter',
  'annual leave encashment',
  'employee information',
  'emergency leave',
  'email acknowledgement',
  'acknowledgement letter',
  'end of service acknowledgement',
  'loan',
  'leave application',
  'sickness self certificate',
  'short absent',
  'salary advance',
  'new starter',
  'others'
) NOT NULL;

-- Step 3: Verify the change
-- SHOW COLUMNS FROM forms WHERE Field = 'document_for';

-- Note: This migration safely adds 'others' to the existing ENUM values
-- Existing data will not be affected
