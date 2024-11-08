#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    // Get database and migration paths
    const dbPath = join(__dirname, '..', 'research_assistant.db');
    const migrationPath = join(__dirname, '..', 'src', 'db', 'migrations', '0000_initial.sql');
    
    // Initialize database
    const db = new Database(dbPath);
    
    // Enable foreign keys
    db.exec('PRAGMA foreign_keys = ON;');
    
    // Read and execute migration
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    db.exec(migrationSQL);
    
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();