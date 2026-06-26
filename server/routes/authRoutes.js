import { Router } from 'express';
import { authController, otpController } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import {
  loginValidation,
  setupValidation,
  emailValidation,
  otpValidation,
  resetPasswordValidation,
  profileValidation,
} from '../middleware/validators.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/check-setup', authController.checkSetup);
router.post('/setup', authLimiter, setupValidation, validate, authController.setup);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/profile', authenticate, profileValidation, validate, authController.updateProfile);
router.post('/forgot-password', authLimiter, emailValidation, validate, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidation, validate, authController.resetPassword);

router.post('/send-otp', otpLimiter, emailValidation, validate, otpController.sendOtp);
router.post('/verify-otp', otpLimiter, otpValidation, validate, otpController.verifyOtp);
router.post('/resend-otp', otpLimiter, emailValidation, validate, otpController.resendOtp);

export default router;
