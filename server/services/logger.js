import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, '..', '..', 'logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const writeLog = (type, message, meta = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    type,
    message,
    ...meta,
  };
  const line = JSON.stringify(entry);
  console.log(`[${type}] ${message}`, meta.email || meta.username || meta.ip || '');
  try {
    fs.appendFileSync(path.join(LOG_DIR, `${type}.log`), `${line}\n`);
    fs.appendFileSync(path.join(LOG_DIR, 'combined.log'), `${line}\n`);
  } catch {
    // Logging should not break the app
  }
};

export const logger = {
  loginAttempt: (username, success, ip) =>
    writeLog('login', success ? 'Login successful' : 'Login failed', { username, success, ip }),
  otpRequest: (email, purpose, ip) =>
    writeLog('otp', 'OTP requested', { email, purpose, ip }),
  passwordReset: (email, success, ip) =>
    writeLog('password-reset', success ? 'Password reset successful' : 'Password reset failed', {
      email,
      success,
      ip,
    }),
  upload: (filename, mimetype, ip) =>
    writeLog('upload', 'File uploaded', { filename, mimetype, ip }),
  error: (message, meta = {}) => writeLog('error', message, meta),
};
