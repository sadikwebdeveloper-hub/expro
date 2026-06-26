import settingsService from '../services/settingsService.js';
import mailService from '../services/mailService.js';
import auditService from '../services/auditService.js';
import imageService from '../services/imageService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitizeObject } from '../utils/sanitize.js';

export const settingsController = {
  async getSettings(req, res) {
    const settings = await settingsService.getSettings(false);
    return sendSuccess(res, 'Settings retrieved', settings);
  },

  async updateSettings(req, res) {
    try {
      const { smtpPassword, ...updates } = req.body;
      const settings = await settingsService.updateSettings(sanitizeObject(updates, 2000), {
        smtpPassword,
      });

      await auditService.log(req, 'Global Settings Updated', {
        sections: Object.keys(updates),
      });

      if (updates.smtp) {
        await auditService.log(req, 'SMTP Changed', { sections: ['smtp'] });
      }

      return sendSuccess(res, 'Settings saved successfully', settings);
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  async testSmtp(req, res) {
    try {
      const { testEmail, smtpPassword, smtp: smtpOverride } = req.body;
      const recipient = testEmail || req.user?.email;

      if (!recipient) {
        return sendError(res, 'Test email address is required', 400);
      }

      let effectiveOverride = null;
      if (smtpOverride) {
        const current = await settingsService.getEffectiveSmtpConfig();
        effectiveOverride = {
          ...current,
          ...smtpOverride,
          password: smtpPassword || current.password,
        };
      } else if (smtpPassword) {
        const current = await settingsService.getEffectiveSmtpConfig();
        effectiveOverride = { ...current, password: smtpPassword };
      }

      const result = await mailService.testConnection(recipient, effectiveOverride);

      await auditService.log(req, 'SMTP Test', {
        success: result.success,
        recipient,
      });

      if (result.success) {
        return sendSuccess(res, '✓ SMTP Connected Successfully', result);
      }

      return sendError(res, `❌ ${result.message}`, 400, result);
    } catch (err) {
      return sendError(res, `❌ SMTP Authentication Failed - ${err.message}`, 400);
    }
  },

  async uploadLogo(req, res) {
    try {
      const settings = await settingsService.getSettings(true);
      const logoUrl = await imageService.processBrandingUpload(
        req.file,
        'logo',
        settings.branding.logoUrl
      );

      const updated = await settingsService.updateSettings({
        branding: { logoUrl },
      });

      await auditService.log(req, 'Logo Updated', { logoUrl });
      return sendSuccess(res, 'Logo uploaded successfully', updated.branding);
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  async uploadFavicon(req, res) {
    try {
      const settings = await settingsService.getSettings(true);
      const faviconUrl = await imageService.processBrandingUpload(
        req.file,
        'favicon',
        settings.branding.faviconUrl
      );

      const updated = await settingsService.updateSettings({
        branding: { faviconUrl },
      });

      await auditService.log(req, 'Favicon Updated', { faviconUrl });
      return sendSuccess(res, 'Favicon uploaded successfully', updated.branding);
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  async addContactEmail(req, res) {
    try {
      const emails = await settingsService.addNotificationEmail(req.body.email);
      await auditService.log(req, 'Contact Email Added', { email: req.body.email });
      return sendSuccess(res, 'Email added', { notificationEmails: emails });
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  async removeContactEmail(req, res) {
    try {
      const emails = await settingsService.removeNotificationEmail(req.body.email);
      await auditService.log(req, 'Contact Email Removed', { email: req.body.email });
      return sendSuccess(res, 'Email removed', { notificationEmails: emails });
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  async updateContactEmail(req, res) {
    try {
      const emails = await settingsService.updateNotificationEmail(
        req.body.oldEmail,
        req.body.newEmail
      );
      await auditService.log(req, 'Contact Email Edited', {
        oldEmail: req.body.oldEmail,
        newEmail: req.body.newEmail,
      });
      return sendSuccess(res, 'Email updated', { notificationEmails: emails });
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },
};

export default settingsController;
