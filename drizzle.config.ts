import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: 'research_assistant.db'
  },
  verbose: true,
  strict: true,
} satisfies Config;