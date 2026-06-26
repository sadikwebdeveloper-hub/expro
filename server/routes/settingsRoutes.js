import { Router } from 'express';
import settingsController from '../controllers/settingsController.js';
import { authenticate, requireSuperAdmin, requirePermission } from '../middleware/auth.js';
import { upload } from '../config/upload.js';
import { validate } from '../middleware/validate.js';
import { body } from 'express-validator';
import { sanitizeEmail } from '../utils/sanitize.js';

const router = Router();

const emailBody = [
  body('email').isEmail().withMessage('Valid email is required').customSanitizer(sanitizeEmail),
];

router.get('/settings', authenticate, requirePermission('settings'), settingsController.getSettings);
router.put('/settings', authenticate, requirePermission('settings'), settingsController.updateSettings);
router.post(
  '/settings/test-smtp',
  authenticate,
  requirePermission('settings'),
  settingsController.testSmtp
);

router.post(
  '/settings/logo',
  authenticate,
  requirePermission('settings'),
  upload.single('logo'),
  settingsController.uploadLogo
);
router.post(
  '/settings/favicon',
  authenticate,
  requirePermission('settings'),
  upload.single('favicon'),
  settingsController.uploadFavicon
);

router.post(
  '/settings/contact-emails',
  authenticate,
  requirePermission('settings'),
  emailBody,
  validate,
  settingsController.addContactEmail
);
router.delete(
  '/settings/contact-emails',
  authenticate,
  requirePermission('settings'),
  emailBody,
  validate,
  settingsController.removeContactEmail
);
router.put(
  '/settings/contact-emails',
  authenticate,
  requirePermission('settings'),
  body('oldEmail').isEmail().customSanitizer(sanitizeEmail),
  body('newEmail').isEmail().customSanitizer(sanitizeEmail),
  validate,
  settingsController.updateContactEmail
);

export default router;
