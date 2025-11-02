-- Fix invoice_attachments.attachment_url column to support long URLs (pre-signed URLs)
-- Pre-signed URLs can be 400-600+ characters, so VARCHAR(255) is too small

ALTER TABLE invoice_attachments 
MODIFY COLUMN attachment_url TEXT NOT NULL;

-- This will allow storing full pre-signed URLs without truncation
