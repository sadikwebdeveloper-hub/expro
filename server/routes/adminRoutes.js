import { Router } from 'express';
import adminController from '../controllers/adminController.js';
import { authenticate, requireSuperAdmin, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { body } from 'express-validator';
import { sanitizeEmail, sanitizeString } from '../utils/sanitize.js';

const router = Router();

const adminCreateValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required').customSanitizer(sanitizeEmail),
  body('role').notEmpty().withMessage('Role is required'),
];

router.get('/admins', authenticate, requirePermission('admins'), adminController.list);
router.get('/audit-logs', authenticate, requirePermission('auditLogs'), adminController.auditLogs);

router.post(
  '/admins',
  authenticate,
  requireSuperAdmin,
  adminCreateValidation,
  validate,
  adminController.create
);
router.put('/admins/:id', authenticate, requireSuperAdmin, adminController.update);
router.delete('/admins/:id', authenticate, requireSuperAdmin, adminController.remove);
router.post('/admins/:id/reset-password', authenticate, requireSuperAdmin, adminController.resetPassword);
router.post('/admins/:id/suspend', authenticate, requireSuperAdmin, adminController.suspend);
router.post('/admins/:id/activate', authenticate, requireSuperAdmin, adminController.activate);

export default router;
