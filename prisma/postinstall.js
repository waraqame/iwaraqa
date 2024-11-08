import { execSync } from 'child_process';
import { mkdirSync } from 'fs';

// Create the generated client directory if it doesn't exist
try {
  mkdirSync('./prisma/generated/client', { recursive: true });
} catch (error) {
  // Directory already exists, ignore error
}

// Generate Prisma Client
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to generate Prisma Client:', error);
  process.exit(1);
}