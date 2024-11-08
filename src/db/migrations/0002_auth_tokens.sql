-- Add token fields to users table
ALTER TABLE users ADD COLUMN access_token TEXT;
ALTER TABLE users ADD COLUMN refresh_token TEXT;
ALTER TABLE users ADD COLUMN token_expiry TIMESTAMP;

-- Create index for token lookups
CREATE INDEX idx_users_access_token ON users(access_token);
CREATE INDEX idx_users_refresh_token ON users(refresh_token);