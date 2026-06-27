import dotenv from 'dotenv';

dotenv.config();

const parsePort = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return ['true', '1', 'yes'].includes(String(value).toLowerCase());
};

export const env = {
  port: parsePort(process.env.PORT, 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parsePort(process.env.SMTP_PORT, 587),
    secure: parseBool(process.env.SMTP_SECURE, parsePort(process.env.SMTP_PORT, 587) === 465),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.SMTP_FROM_NAME || 'Expro Group',
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '',
    replyTo: process.env.MAIL_REPLY_TO || process.env.SMTP_FROM_EMAIL || '',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
};

export default env;
