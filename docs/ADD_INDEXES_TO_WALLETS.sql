-- Add indexes for frequently accessed columns
ALTER TABLE wallets ADD INDEX idx_status (status);
ALTER TABLE wallets ADD INDEX idx_currency (currency);
ALTER TABLE wallets ADD INDEX idx_client_id (client_id);
ALTER TABLE wallets ADD INDEX idx_balance (balance);
ALTER TABLE wallets ADD INDEX idx_created_at (created_at);
ALTER TABLE wallets ADD INDEX idx_updated_at (updated_at);

-- Add compound index for common filter combinations
ALTER TABLE wallets ADD INDEX idx_status_currency (status, currency);
ALTER TABLE wallets ADD INDEX idx_client_currency (client_id, currency);

-- Add fulltext index for search if MySQL version supports it
ALTER TABLE wallets ADD FULLTEXT INDEX ft_wallet_search (id);