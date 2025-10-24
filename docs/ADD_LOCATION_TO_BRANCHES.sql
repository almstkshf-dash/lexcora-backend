-- Add location column to branches table if it doesn't exist
-- This migration adds a location field to store branch addresses

-- Check if the column exists and add it if not
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT NULL;

-- Optional: Update existing branches with a default location if needed
-- UPDATE branches SET location = 'Not specified' WHERE location IS NULL;

-- Verify the changes
SELECT * FROM branches LIMIT 5;
