import nodemailer from 'nodemailer';
import env from '../config/env.js';
import settingsService from './settingsService.js';
import templates from './mailTemplates.js';

const buildTransportOptions = (smtp) => {
  const secure = smtp.port === 465;
  return {
    host: smtp.host,
    port: smtp.port,
    secure,
    auth: {
      user: smtp.username,
      pass: smtp.password,
    },
    ...(smtp.port === 587 ? { requireTLS: true } : {}),
  };
};

const createTransporter = async (overrideSmtp = null) => {
  const smtp = overrideSmtp || (await settingsService.getEffectiveSmtpConfig());

  if (!smtp.host || !smtp.username || !smtp.password) {
    console.log('[SMTP DEBUG] Missing credentials:', {
      hasHost: !!smtp.host,
      hasUsername: !!smtp.username,
      hasPassword: !!smtp.password,
      passwordLength: smtp.password?.length || 0
    });
    return { transporter: null, smtp };
  }

  const options = buildTransportOptions(smtp);
  console.log('[SMTP DEBUG] Transport options:', {
    host: options.host,
    port: options.port,
    secure: options.secure,
    requireTLS: options.requireTLS,
    username: options.auth.user,
    passwordLength: options.auth.pass?.length || 0
  });

  const transporter = nodemailer.createTransport(options);
  return { transporter, smtp };
};

export const mailService = {
  async isConfigured() {
    const smtp = await settingsService.getEffectiveSmtpConfig();
    return Boolean(smtp.enabled && smtp.host && smtp.username && smtp.password);
  },

  async sendWithConfig({ to, subject, text, html, smtpOverride = null }) {
    const { transporter, smtp } = await createTransporter(smtpOverride);

    if (!transporter) {
      if (env.isProduction) {
        throw new Error('Email service is not configured');
      }
      console.warn('[mail] SMTP not configured. Would send to:', to, subject);
      return { messageId: 'dev-mode', accepted: [to] };
    }

    const from = smtp.fromName
      ? `"${smtp.fromName}" <${smtp.fromEmail || smtp.username}>`
      : smtp.fromEmail || smtp.username;

    return transporter.sendMail({
      from,
      to,
      replyTo: smtp.replyTo || smtp.fromEmail,
      subject,
      text,
      html: html || text,
    });
  },

  async testConnection(testEmail, smtpOverride = null) {
    try {
      const { transporter, smtp } = await createTransporter(smtpOverride);
      if (!transporter) {
        return { success: false, message: 'SMTP Authentication Failed - not configured' };
      }

      await transporter.verify();

      if (testEmail) {
        await transporter.sendMail({
          from: smtp.fromName
            ? `"${smtp.fromName}" <${smtp.fromEmail || smtp.username}>`
            : smtp.fromEmail || smtp.username,
          to: testEmail,
          subject: 'Expro Group - SMTP Test',
          text: 'SMTP Connected Successfully',
          html: templates.smtpTest(),
        });
      }

      return { success: true, message: 'SMTP Connected Successfully' };
    } catch (err) {
      return { success: false, message: `SMTP Authentication Failed - ${err.message}` };
    }
  },

  async sendOtpEmail(to, otp, purpose = 'verification') {
    const smtp = await settingsService.getEffectiveSmtpConfig();
    if (!smtp.enabled || !smtp.enableOtp) {
      if (!env.isProduction) {
        console.warn('[mail] OTP for', to, ':', otp);
        return { messageId: 'dev-mode' };
      }
      throw new Error('OTP email is disabled');
    }

    const subject =
      purpose === 'reset'
        ? 'Expro Group - Password Reset Code'
        : 'Expro Group - Verification Code';

    return this.sendWithConfig({
      to,
      subject,
      text: `Your code is ${otp}. Expires in 5 minutes.`,
      html: templates.otp(otp, purpose),
    });
  },

  async sendContactFormNotification(messageData) {
    const smtp = await settingsService.getEffectiveSmtpConfig();
    if (!smtp.enabled || !smtp.enableContactForm) {
      console.warn('[mail] Contact form email disabled or SMTP not configured');
      return null;
    }

    const settings = await settingsService.getSettings(true);
    const recipients = settings.contact.notificationEmails || [];

    if (!recipients.length) {
      console.warn('[mail] No notification emails configured');
      return null;
    }

    const subject = `Contact Form: ${messageData.subject}`;
    const html = templates.contactForm(messageData);
    const text = `From: ${messageData.name} (${messageData.email})\nSubject: ${messageData.subject}\n\n${messageData.message}`;

    return Promise.all(
      recipients.map((to) =>
        this.sendWithConfig({ to, subject, text, html }).catch((err) => {
          console.error('[mail] Failed to send to', to, err.message);
          return null;
        })
      )
    );
  },

  async sendAdminInvitation({ to, fullName, username, tempPassword, loginUrl }) {
    const smtp = await settingsService.getEffectiveSmtpConfig();
    if (!smtp.enabled) return null;

    return this.sendWithConfig({
      to,
      subject: 'Expro Group - Admin Account Invitation',
      text: `Username: ${username}\nTemporary Password: ${tempPassword}\nLogin: ${loginUrl}`,
      html: templates.adminInvitation({ fullName, username, tempPassword, loginUrl }),
    });
  },

  async sendWelcomeEmail({ to, fullName }) {
    const smtp = await settingsService.getEffectiveSmtpConfig();
    if (!smtp.enabled || !smtp.enableWelcome) return null;

    return this.sendWithConfig({
      to,
      subject: 'Welcome to Expro Group Admin',
      text: `Welcome ${fullName}!`,
      html: templates.welcome({ fullName }),
    });
  },
};

export default mailService;
