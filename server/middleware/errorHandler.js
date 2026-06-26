import { sendError } from '../utils/response.js';
import { logger } from '../services/logger.js';

export const notFoundHandler = (req, res) => {
  if (req.path.startsWith('/api')) {
    return sendError(res, 'API endpoint not found', 404);
  }
  return res.status(404).send('Not Found');
};

export const errorHandler = (err, req, res, _next) => {
  logger.error(err.message, { path: req.path, method: req.method });

  if (err.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large. Maximum size is 5MB.'
        : err.message;
    return sendError(res, message, 400);
  }

  if (err.message?.includes('Invalid file type')) {
    return sendError(res, err.message, 400);
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return sendError(res, message, statusCode);
};
