import { db } from './index';
import { hash } from 'bcryptjs';

export async function initializeDatabase() {
  try {
    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        avatar TEXT,
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        credits INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if demo user exists
    const demoUser = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@example.com');
    
    if (!demoUser) {
      // Create demo user
      const hashedPassword = await hash('password123', 10);
      
      db.prepare(`
        INSERT INTO users (name, email, password, avatar, is_verified, credits)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        'مستخدم تجريبي',
        'demo@example.com',
        hashedPassword,
        'م',
        1,
        13
      );

      console.log('Demo user created successfully');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}