import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 422, errors.array());
  }
  next();
};
