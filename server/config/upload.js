import multer from 'multer';
import { logger } from '../services/logger.js';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG'));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

export const logUpload = (req, file, url = '') => {
  if (file) {
    logger.upload(url || file.originalname, file.mimetype, req.ip);
  }
};

// Legacy path kept for backward compatibility with existing /uploads URLs
export const UPLOADS_DIR = null;
