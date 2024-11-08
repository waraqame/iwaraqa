-- Add credits column to users
ALTER TABLE users ADD COLUMN credits INTEGER NOT NULL DEFAULT 0;

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add AI usage tracking to sections
ALTER TABLE sections ADD COLUMN ai_usage_count INTEGER NOT NULL DEFAULT 0;