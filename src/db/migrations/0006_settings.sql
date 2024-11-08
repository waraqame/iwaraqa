-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  basic_package_price INTEGER NOT NULL DEFAULT 100,
  pro_package_price INTEGER NOT NULL DEFAULT 200,
  basic_package_credits INTEGER NOT NULL DEFAULT 13,
  pro_package_credits INTEGER NOT NULL DEFAULT 30,
  max_project_size INTEGER NOT NULL DEFAULT 50,
  allowed_languages TEXT NOT NULL DEFAULT '["ar"]',
  ai_model TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
  max_tokens INTEGER NOT NULL DEFAULT 2000,
  temperature REAL NOT NULL DEFAULT 0.7,
  openai_api_key TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);