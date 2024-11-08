import Database from 'better-sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize database
const db = new Database(join(__dirname, '../../research_assistant.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
const initDb = () => {
  console.log('[DB] Initializing database...');
  
  try {
    // Users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        avatar TEXT,
        is_verified INTEGER NOT NULL DEFAULT 1,
        credits INTEGER NOT NULL DEFAULT 13,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create demo user if it doesn't exist
    const demoUser = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@example.com');
    
    if (!demoUser) {
      console.log('[DB] Creating demo user...');
      db.prepare(`
        INSERT INTO users (name, email, password, avatar, is_verified, credits)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        'مستخدم تجريبي',
        'demo@example.com',
        '$2a$10$rDx2nayECs1Q85aNXwyxVu2NB9POZXXm1RvYvgZx.91n0.93.N9Ym', // password123
        'م',
        1,
        13
      );
    }

    console.log('[DB] Database initialized successfully');
  } catch (error) {
    console.error('[DB] Database initialization error:', error);
    throw error;
  }
};

// Initialize database
initDb();

export { db };