interface Env {
  DATABASE_URL: string;
  NODE_ENV: string;
  GOOGLE_CLOUD_PROJECT?: string;
}

export const env: Env = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/waraqa',
  NODE_ENV: process.env.NODE_ENV || 'development',
  GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT
};