-- Migration: Add client_status and opponent_status columns to case_degrees table
-- Date: 2025-10-29

-- Add client_status column
ALTER TABLE `case_degrees` 
ADD COLUMN `client_status` VARCHAR(255) DEFAULT NULL AFTER `referral_date`;

-- Add opponent_status column
ALTER TABLE `case_degrees` 
ADD COLUMN `opponent_status` VARCHAR(255) DEFAULT NULL AFTER `client_status`;
