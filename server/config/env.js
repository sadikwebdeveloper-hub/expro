import dotenv from 'dotenv';

dotenv.config();

const parsePort = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: parsePort(process.env.PORT, 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parsePort(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  mailFrom: process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@exprogroup.com',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
};

export default env;
