-- Create verification_tokens table if not exists
CREATE TABLE IF NOT EXISTS verification_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_sections_project_id ON sections(project_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);

-- Add missing columns to sections
ALTER TABLE sections ADD COLUMN IF NOT EXISTS ai_usage_count INTEGER NOT NULL DEFAULT 0;

-- Add missing columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 0;

-- Update existing timestamps to use CURRENT_TIMESTAMP
UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE projects SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;
UPDATE sections SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE sections SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;
UPDATE credit_transactions SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;