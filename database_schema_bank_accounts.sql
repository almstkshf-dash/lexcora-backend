-- Database schema for Bank Accounts and Deposits

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS `bank_accounts` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `bank_name` VARCHAR(255) NOT NULL,
  `account_name` VARCHAR(255) NOT NULL,
  `account_number` VARCHAR(100) NOT NULL,
  `iban` VARCHAR(50) DEFAULT NULL,
  `branch_id` INT(11) DEFAULT NULL,
  `current_balance` DECIMAL(15,2) DEFAULT 0.00,
  `status` ENUM('active', 'inactive', 'closed') DEFAULT 'active',
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_bank_accounts_branch` (`branch_id`),
  KEY `fk_bank_accounts_created_by` (`created_by`),
  CONSTRAINT `fk_bank_accounts_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bank_accounts_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create deposits table
CREATE TABLE IF NOT EXISTS `deposits` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `bank_account_id` INT(11) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `deposit_date` DATE NOT NULL,
  `reference_number` VARCHAR(100) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `depositor_name` VARCHAR(255) DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_deposits_bank_account` (`bank_account_id`),
  KEY `fk_deposits_created_by` (`created_by`),
  CONSTRAINT `fk_deposits_bank_account` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_deposits_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data (optional)
-- INSERT INTO `bank_accounts`(`bank_name`, `account_name`, `account_number`, `iban`, `branch_id`, `current_balance`, `status`, `created_by`) 
-- VALUES ('البنك الأهلي', 'الحساب الرئيسي', '1234567890', 'SA0380000000608010167519', 1, 0.00, 'active', 1);
