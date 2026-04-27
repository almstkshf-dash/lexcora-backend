-- Migration: Banking and Cash Management
-- Created At: 2026-04-27

-- Bank Account Logs (Financial transactions)
CREATE TABLE IF NOT EXISTS `bank_account_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `bank_account_id` INT NOT NULL,
  `type` ENUM('deposit', 'withdrawal') NOT NULL,
  `amount` DECIMAL(18,2) NOT NULL,
  `description` TEXT,
  `created_by` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bank Account Log Attachments
CREATE TABLE IF NOT EXISTS `bank_account_log_attachments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `log_id` INT NOT NULL,
  `document_name` VARCHAR(255),
  `document_url` VARCHAR(1000),
  `uploaded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`log_id`) REFERENCES `bank_account_logs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bank Statement Imports
CREATE TABLE IF NOT EXISTS `bank_statement_imports` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `bank_account_id` INT NOT NULL,
  `import_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `filename` VARCHAR(255),
  `file_url` VARCHAR(1000),
  `status` ENUM('pending', 'processed', 'error') DEFAULT 'pending',
  `created_by` INT,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bank Statement Lines
CREATE TABLE IF NOT EXISTS `bank_statement_lines` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `import_id` INT NOT NULL,
  `transaction_date` DATE NOT NULL,
  `description` TEXT,
  `amount` DECIMAL(18,2) NOT NULL,
  `reference` VARCHAR(255),
  `fitid` VARCHAR(255),
  `is_reconciled` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`import_id`) REFERENCES `bank_statement_imports`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bank Reconciliations
CREATE TABLE IF NOT EXISTS `bank_reconciliations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `bank_account_id` INT NOT NULL,
  `bank_statement_line_id` INT NOT NULL,
  `bank_account_log_id` INT NOT NULL,
  `reconciled_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `reconciled_by` INT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_statement_line` (`bank_statement_line_id`),
  UNIQUE KEY `unique_account_log` (`bank_account_log_id`),
  FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`bank_statement_line_id`) REFERENCES `bank_statement_lines`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`bank_account_log_id`) REFERENCES `bank_account_logs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Petty Cash Funds
CREATE TABLE IF NOT EXISTS `petty_cash_funds` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `branch_id` INT,
  `responsible_employee_id` INT,
  `current_balance` DECIMAL(18,2) DEFAULT 0.00,
  `limit_amount` DECIMAL(18,2) DEFAULT 0.00,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_by` INT,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`responsible_employee_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Petty Cash Transactions
CREATE TABLE IF NOT EXISTS `petty_cash_transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fund_id` INT NOT NULL,
  `transaction_date` DATE NOT NULL,
  `amount` DECIMAL(18,2) NOT NULL,
  `type` ENUM('disbursement', 'replenishment') NOT NULL,
  `description` TEXT,
  `reference_number` VARCHAR(100),
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_by` INT,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`fund_id`) REFERENCES `petty_cash_funds`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add petty_cash_fund_id to bank_account_logs
-- Using a procedure to avoid error if column already exists
DELIMITER //
CREATE PROCEDURE AddPettyCashColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns 
        WHERE table_name = 'bank_account_logs' AND column_name = 'petty_cash_fund_id'
    ) THEN
        ALTER TABLE `bank_account_logs` ADD COLUMN `petty_cash_fund_id` INT DEFAULT NULL;
        ALTER TABLE `bank_account_logs` ADD FOREIGN KEY (`petty_cash_fund_id`) REFERENCES `petty_cash_funds`(`id`) ON DELETE SET NULL;
    END IF;
END //
DELIMITER ;
CALL AddPettyCashColumn();
DROP PROCEDURE AddPettyCashColumn;
