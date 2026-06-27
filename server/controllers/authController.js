import db from '../database/index.js';
import authService from '../services/authService.js';
import adminService from '../services/adminService.js';
import otpService from '../services/otpService.js';
import settingsService from '../services/settingsService.js';
import { logger } from '../services/logger.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitizeObject } from '../utils/sanitize.js';

export const authController = {
  async checkSetup(req, res) {
    const data = await db.getAll();
    const needsSetup = !data.users || data.users.length === 0;
    return sendSuccess(res, 'Setup status retrieved', { needsSetup });
  },

  async setup(req, res) {
    try {
      const safeBody = sanitizeObject(req.body);
      const user = await authService.setupAdmin(safeBody);
      return sendSuccess(res, 'Setup completed successfully', { user }, 201);
    } catch (err) {
      return sendError(res, err.message, 403, err.message);
    }
  },

  async login(req, res) {
    const { username, password, rememberMe = false, otp } = req.body;
    const result = await authService.login(username, password, rememberMe);

    if (result?.error) {
      logger.loginAttempt(username, false, req.ip);
      const user = await authService.findUserByUsername(username);
      if (user) await adminService.recordLogin(user, req, false, rememberMe);
      return sendError(res, result.error, 401, result.error);
    }

    if (otp) {
      const user = await authService.findUserByUsername(username);
      try {
        await otpService.verifyOtp(user.email, otp, 'login', { ip: req.ip });
      } catch (err) {
        return sendError(res, err.message, 401, err.message);
      }
    }

    logger.loginAttempt(username, true, req.ip);
    const rawUser = await authService.findUserByUsername(username);
    await adminService.recordLogin(rawUser, req, true, rememberMe);
    return sendSuccess(res, 'Login successful', result);
  },

  async logout(req, res) {
    await adminService.recordLogout(req);
    return sendSuccess(res, 'Logged out successfully', null);
  },

  async updateProfile(req, res) {
    try {
      const { userId, ...updates } = sanitizeObject(req.body);
      if (req.user && req.user.userId !== userId && req.user.role !== 'super_admin') {
        return sendError(res, 'Not authorized to update this profile', 403);
      }
      const user = await authService.updateProfile(Number(userId), updates);
      return sendSuccess(res, 'Profile updated successfully', { user });
    } catch (err) {
      return sendError(res, err.message, 404, err.message);
    }
  },

  async forgotPassword(req, res) {
    const { email } = req.body;
    const user = await authService.findUserByEmail(email);

    if (!user) {
      logger.passwordReset(email, false, req.ip);
      return sendError(res, 'Email not found', 404, 'Email not found');
    }

    const smtp = await settingsService.getEffectiveSmtpConfig();
    if (!smtp.enabled || smtp.enableForgotPassword === false) {
      return sendError(res, 'Password reset email is currently disabled', 503);
    }

    try {
      await otpService.createAndSendOtp(email, 'reset', req.ip);
    } catch (err) {
      return sendError(res, err.message, 429, err.message);
    }

    logger.passwordReset(email, true, req.ip);
    return sendSuccess(res, 'OTP sent to your email', { otpSent: true });
  },

  async resetPassword(req, res) {
    const { email, otp, newPassword } = req.body;

    const user = await authService.findUserByEmail(email);
    if (!user) {
      return sendError(res, 'Email not found', 404, 'Email not found');
    }

    try {
      await otpService.verifyOtp(email, otp, 'reset', { consume: true, ip: req.ip });
    } catch (err) {
      logger.passwordReset(email, false, req.ip);
      return sendError(res, err.message, 400, err.message);
    }

    await authService.resetPassword(email, newPassword);
    logger.passwordReset(email, true, req.ip);
    return sendSuccess(res, 'Password reset successfully', null);
  },
};

export const otpController = {
  async sendOtp(req, res) {
    const { email, purpose = 'verification' } = req.body;

    if (purpose === 'reset') {
      const user = await authService.findUserByEmail(email);
      if (!user) return sendError(res, 'Email not found', 404, 'Email not found');
    }

    try {
      const result = await otpService.createAndSendOtp(email, purpose, req.ip);
      return sendSuccess(res, 'OTP sent successfully', result);
    } catch (err) {
      return sendError(res, err.message, 429, err.message);
    }
  },

  async verifyOtp(req, res) {
    const { email, otp, purpose = 'verification' } = req.body;

    if (purpose === 'reset') {
      const user = await authService.findUserByEmail(email);
      if (!user) return sendError(res, 'Email not found', 404, 'Email not found');
    }

    try {
      const consume = purpose !== 'reset';
      const result = await otpService.verifyOtp(email, otp, purpose, { consume, ip: req.ip });
      return sendSuccess(res, 'OTP verified successfully', result);
    } catch (err) {
      return sendError(res, err.message, 400, err.message);
    }
  },

  async resendOtp(req, res) {
    const { email, purpose = 'verification' } = req.body;

    if (purpose === 'reset') {
      const user = await authService.findUserByEmail(email);
      if (!user) return sendError(res, 'Email not found', 404, 'Email not found');
    }

    try {
      const result = await otpService.resendOtp(email, purpose, req.ip);
      return sendSuccess(res, 'OTP resent successfully', result);
    } catch (err) {
      return sendError(res, err.message, 429, err.message);
    }
  },
};
