import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    csrfSecret: process.env.CSRF_SECRET || 'csrf-secret-change-in-production',
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'changeme',
  },
  uploads: {
    dir: process.env.UPLOADS_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
  },
  isDevelopment: process.env.NODE_ENV !== 'production',
};

export default config;
