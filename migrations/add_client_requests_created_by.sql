-- Add missing columns to client_requests table

-- Add created_by column to track who created the request (employee or NULL if self-created by client)
ALTER TABLE `client_requests` ADD COLUMN `created_by` INT NULL AFTER `response`;

-- Add type column to store request type
ALTER TABLE `client_requests` ADD COLUMN `type` VARCHAR(100) NULL AFTER `request_title`;

-- Add details column to store request details
ALTER TABLE `client_requests` ADD COLUMN `details` TEXT NULL AFTER `type`;

-- Add status column for request approval status
ALTER TABLE `client_requests` ADD COLUMN `status` ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending' AFTER `details`;

-- Add created_at timestamp
ALTER TABLE `client_requests` ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `created_by`;

-- Add foreign key for created_by (optional, commented out if you don't want strict constraint)
-- ALTER TABLE `client_requests` ADD CONSTRAINT `fk_client_requests_created_by` 
-- FOREIGN KEY (`created_by`) REFERENCES `employees`(`id`) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX `idx_client_requests_client_id` ON `client_requests`(`client_id`);
CREATE INDEX `idx_client_requests_created_by` ON `client_requests`(`created_by`);
CREATE INDEX `idx_client_requests_status` ON `client_requests`(`status`);
