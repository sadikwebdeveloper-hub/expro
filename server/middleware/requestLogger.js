import logger from '../services/logger.js';

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      logger.access(req.method, req.path, res.statusCode, Date.now() - start, req.ip);
    }
  });
  next();
};

export default requestLogger;
