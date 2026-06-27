import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, '..', '..', 'logs');

const LOG_FILES = ['error', 'access', 'smtp', 'auth', 'upload', 'combined'];

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const writeToFile = (file, line) => {
  try {
    fs.appendFileSync(path.join(LOG_DIR, `${file}.log`), `${line}\n`);
    fs.appendFileSync(path.join(LOG_DIR, 'combined.log'), `${line}\n`);
  } catch {
    // Never crash on log failure
  }
};

const formatEntry = (level, category, message, meta = {}) => ({
  timestamp: new Date().toISOString(),
  level,
  category,
  message,
  ...meta,
});

export const logger = {
  info(category, message, meta = {}) {
    const entry = formatEntry('info', category, message, meta);
    const line = JSON.stringify(entry);
    console.log(`[${category}] ${message}`);
    writeToFile(category === 'smtp' ? 'smtp' : 'access', line);
  },

  warn(category, message, meta = {}) {
    const entry = formatEntry('warn', category, message, meta);
    const line = JSON.stringify(entry);
    console.warn(`[${category}] ${message}`);
    writeToFile('error', line);
  },

  error(message, meta = {}) {
    const entry = formatEntry('error', 'error', message, meta);
    const line = JSON.stringify(entry);
    console.error(`[error] ${message}`, meta);
    writeToFile('error', line);
  },

  smtp(message, meta = {}) {
    this.info('smtp', message, meta);
  },

  access(method, path, status, ms, ip) {
    const entry = formatEntry('info', 'access', `${method} ${path} ${status} ${ms}ms`, { ip });
    writeToFile('access', JSON.stringify(entry));
  },

  loginAttempt(username, success, ip) {
    const entry = formatEntry('info', 'auth', success ? 'Login successful' : 'Login failed', {
      username,
      success,
      ip,
    });
    writeToFile('auth', JSON.stringify(entry));
    console.log(`[auth] ${success ? 'Login OK' : 'Login FAIL'}: ${username}`);
  },

  otpRequest(email, purpose, ip) {
    this.info('auth', 'OTP requested', { email, purpose, ip });
  },

  otpVerify(email, success, ip) {
    this.info('auth', success ? 'OTP verified' : 'OTP verification failed', { email, ip });
  },

  passwordReset(email, success, ip) {
    this.info('auth', success ? 'Password reset OK' : 'Password reset failed', { email, ip });
  },

  upload(filename, mimetype, ip, provider = 'cloudinary') {
    this.info('upload', 'File uploaded', { filename, mimetype, ip, provider });
  },

  startup(message, meta = {}) {
    this.info('startup', message, meta);
  },
};

export default logger;
