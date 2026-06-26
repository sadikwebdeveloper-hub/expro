import { body } from 'express-validator';
import { sanitizeEmail, sanitizeString } from '../utils/sanitize.js';

export const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const setupValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required').customSanitizer(sanitizeEmail),
];

export const emailValidation = [
  body('email').isEmail().withMessage('Valid email is required').customSanitizer(sanitizeEmail),
];

export const otpValidation = [
  body('email').isEmail().withMessage('Valid email is required').customSanitizer(sanitizeEmail),
  body('otp')
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('OTP must be a 6-digit code'),
];

export const resetPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required').customSanitizer(sanitizeEmail),
  body('otp')
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('OTP must be a 6-digit code'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const profileValidation = [
  body('userId').isInt().withMessage('Valid user ID is required'),
  body('fullName').optional().trim().customSanitizer((v) => sanitizeString(v, 120)),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const messageValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').customSanitizer((v) => sanitizeString(v, 120)),
  body('email').isEmail().withMessage('Valid email is required').customSanitizer(sanitizeEmail),
  body('subject').trim().notEmpty().withMessage('Subject is required').customSanitizer((v) => sanitizeString(v, 200)),
  body('message').trim().notEmpty().withMessage('Message is required').customSanitizer((v) => sanitizeString(v, 2000)),
];
