import bcrypt from 'bcrypt';
import db from '../database/index.js';
import mailService from './mailService.js';
import { logger } from './logger.js';

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_OTP_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

const generateOtpCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const cleanupExpiredOtps = (otps = []) => {
  const now = Date.now();
  return otps.filter((otp) => otp.expiresAt > now - 24 * 60 * 60 * 1000);
};

const countRecentRequests = (otps, email, purpose) => {
  const now = Date.now();
  return otps.filter(
    (otp) =>
      otp.email === email &&
      otp.purpose === purpose &&
      now - otp.createdAt < RATE_LIMIT_WINDOW_MS
  ).length;
};

const getLastOtpTime = (otps, email, purpose) => {
  const matching = otps
    .filter((otp) => otp.email === email && otp.purpose === purpose)
    .sort((a, b) => b.createdAt - a.createdAt);
  return matching[0]?.createdAt || 0;
};

export const otpService = {
  async createAndSendOtp(email, purpose = 'verification', ip = '') {
    const normalizedEmail = email.toLowerCase();

    let rateLimited = false;
    let otpRecord = null;
    let plainOtp = null;

    await db.update(async (data) => {
      data.otps = cleanupExpiredOtps(data.otps || []);

      if (countRecentRequests(data.otps, normalizedEmail, purpose) >= MAX_OTP_PER_WINDOW) {
        rateLimited = true;
        return data;
      }

      const lastTime = getLastOtpTime(data.otps, normalizedEmail, purpose);
      if (Date.now() - lastTime < RESEND_COOLDOWN_MS) {
        rateLimited = true;
        return data;
      }

      plainOtp = generateOtpCode();
      const hashedOtp = await bcrypt.hash(plainOtp, 10);
      const now = Date.now();

      otpRecord = {
        id: Date.now(),
        email: normalizedEmail,
        codeHash: hashedOtp,
        purpose,
        expiresAt: now + OTP_EXPIRY_MS,
        used: false,
        createdAt: now,
      };

      data.otps.unshift(otpRecord);
      return data;
    });

    if (rateLimited) {
      throw new Error('Too many OTP requests. Please try again later.');
    }

    logger.otpRequest(normalizedEmail, purpose, ip);

    await mailService.sendOtpEmail(normalizedEmail, plainOtp, purpose);

    return { email: normalizedEmail, expiresAt: otpRecord.expiresAt };
  },

  async verifyOtp(email, code, purpose = 'verification', { consume = true } = {}) {
    const normalizedEmail = email.toLowerCase();
    const now = Date.now();
    let verified = false;
    let otpId = null;

    await db.update(async (data) => {
      data.otps = cleanupExpiredOtps(data.otps || []);

      const otp = (data.otps || []).find(
        (entry) =>
          entry.email === normalizedEmail &&
          entry.purpose === purpose &&
          !entry.used &&
          entry.expiresAt > now
      );

      if (!otp) return data;

      const match = await bcrypt.compare(code, otp.codeHash);
      if (!match) return data;

      if (consume) {
        otp.used = true;
      } else {
        otp.verified = true;
      }

      verified = true;
      otpId = otp.id;
      return data;
    });

    return verified ? { email: normalizedEmail, otpId } : null;
  },

  async resendOtp(email, purpose = 'verification', ip = '') {
    return this.createAndSendOtp(email, purpose, ip);
  },

  async hasValidVerifiedOtp(email, purpose = 'reset') {
    const normalizedEmail = email.toLowerCase();
    const data = await db.getAll();
    const now = Date.now();

    return (data.otps || []).some(
      (otp) =>
        otp.email === normalizedEmail &&
        otp.purpose === purpose &&
        otp.used &&
        otp.expiresAt > now
    );
  },
};

export default otpService;
