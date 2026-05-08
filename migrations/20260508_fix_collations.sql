-- Fix collation mismatch between currencies and other tables
-- currencies table was created with utf8mb4_unicode_ci, while others use utf8mb4_0900_ai_ci

-- First, drop the foreign key constraint
ALTER TABLE journal_entries DROP FOREIGN KEY journal_entries_ibfk_1;

-- Alter currencies table collation
ALTER TABLE currencies CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Alter specific columns just in case
ALTER TABLE currencies MODIFY code VARCHAR(3) COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE currencies MODIFY name_ar VARCHAR(100) COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE currencies MODIFY name_en VARCHAR(100) COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE currencies MODIFY symbol VARCHAR(10) COLLATE utf8mb4_0900_ai_ci;

-- Re-add the foreign key constraint
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_ibfk_1 FOREIGN KEY (currency_code) REFERENCES currencies(code);
