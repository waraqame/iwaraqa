import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Initialize database
const sqlite = new Database('research_assistant.db');

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Create drizzle database instance
export const db = drizzle(sqlite, { schema });