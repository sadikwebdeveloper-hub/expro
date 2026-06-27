import nodemailer from 'nodemailer';
import dns from 'dns';
import env from '../config/env.js';
import settingsService from './settingsService.js';
import templates from './mailTemplates.js';
import logger from './logger.js';

// Force Node.js to prefer IPv4 to avoid IPv6 connection issues
dns.setDefaultResultOrder('ipv4first');

const SMTP_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

let startupStatus = { verified: false, message: 'Not verified yet', lastCheck: null };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildTransportOptions = (smtp) => {
  const port = Number(smtp.port) || 587;
  // Auto-determine secure based on port: 465 = SSL (secure:true), 587 = STARTTLS (secure:false)
  const secure = port === 465;

  const options = {
    host: smtp.host,
    port,
    secure,
    family: 4, // Force IPv4
    auth: {
      user: smtp.username || smtp.user,
      pass: smtp.password || smtp.pass,
      // Force LOGIN auth method for Gmail to avoid XOAUTH2 issues
      method: 'LOGIN',
    },
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
    // Use minimal TLS configuration to avoid "Unsupported state" errors
    tls: {
      minVersion: 'TLSv1.2',
      servername: smtp.host,
      rejectUnauthorized: true,
    },
  };

  logger.smtp('SMTP Transport Options', {
    host: options.host,
    port: options.port,
    secure: options.secure,
    family: options.family,
    authMethod: options.auth.method,
    tlsMinVersion: options.tls.minVersion,
    username: options.auth.user,
    passwordLength: (options.auth.pass || '').length,
  });

  return options;
};

const resolveSmtp = async (override = null) => {
  if (override) return override;
  return settingsService.getEffectiveSmtpConfig();
};

const createTransporter = async (smtpOverride = null) => {
  const smtp = await resolveSmtp(smtpOverride);
  const username = smtp.username || smtp.user;
  const password = smtp.password || smtp.pass;

  // Log SMTP source detection
  const source = smtpOverride ? 'OVERRIDE' : (env.smtp.host && env.smtp.user ? 'ENV_FALLBACK' : 'DATABASE');
  logger.smtp('SMTP Config Source', { source, host: smtp.host, username, passwordLength: password?.length || 0 });

  if (!smtp.host || !username || !password) {
    logger.smtp('SMTP Configuration Missing', { hasHost: !!smtp.host, hasUsername: !!username, hasPassword: !!password });
    return { transporter: null, smtp };
  }

  const transporter = nodemailer.createTransport(buildTransportOptions({ ...smtp, username, password }));

  // Log resolved host information
  try {
    const addresses = await dns.promises.resolve4(smtp.host);
    logger.smtp('SMTP Host IPv4 Resolved', { host: smtp.host, addresses, preferred: addresses[0] });
  } catch (err) {
    logger.smtp('DNS Resolution Warning', { host: smtp.host, error: err.message });
  }

  return { transporter, smtp: { ...smtp, username, password } };
};

const withRetry = async (fn, label) => {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      logger.smtp(`${label} failed (attempt ${attempt}/${MAX_RETRIES})`, { error: err.message });
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  throw lastError;
};

export const mailService = {
  getStartupStatus() {
    return startupStatus;
  },

  async verifyOnStartup() {
    try {
      const smtp = await settingsService.getEffectiveSmtpConfig();
      if (!smtp.enabled) {
        startupStatus = {
          verified: false,
          message: '❌ SMTP Failed — SMTP is disabled in settings',
          lastCheck: new Date().toISOString(),
        };
        logger.smtp(startupStatus.message);
        console.log(startupStatus.message);
        return startupStatus;
      }

      const { transporter } = await createTransporter();
      if (!transporter) {
        startupStatus = {
          verified: false,
          message: '❌ SMTP Failed — Missing host, username, or password',
          lastCheck: new Date().toISOString(),
        };
        logger.smtp(startupStatus.message);
        console.log(startupStatus.message);
        return startupStatus;
      }

      await withRetry(() => transporter.verify(), 'SMTP startup verify');
      startupStatus = {
        verified: true,
        message: '✓ SMTP Connected',
        lastCheck: new Date().toISOString(),
        host: smtp.host,
        port: smtp.port,
      };
      logger.smtp('✓ SMTP Connected on startup', { host: smtp.host, port: smtp.port });
      console.log('✓ SMTP Connected');
      return startupStatus;
    } catch (err) {
      startupStatus = {
        verified: false,
        message: `❌ SMTP Failed — ${err.message}`,
        lastCheck: new Date().toISOString(),
      };
      logger.smtp(startupStatus.message, { error: err.message, stack: err.stack });
      console.error(startupStatus.message);
      console.error('Full error details:', err);
      return startupStatus;
    }
  },

  async isConfigured() {
    const smtp = await settingsService.getEffectiveSmtpConfig();
    return Boolean(smtp.enabled && smtp.host && (smtp.username || smtp.user) && (smtp.password || smtp.pass));
  },

  async sendWithConfig({ to, subject, text, html, smtpOverride = null }) {
    const { transporter, smtp } = await createTransporter(smtpOverride);

    if (!transporter) {
      const msg = 'Email service is not configured';
      logger.smtp(`Send blocked: ${msg}`, { to, subject });
      if (env.isProduction) throw new Error(msg);
      console.warn(`[mail] DEV MODE — would send to ${to}: ${subject}`);
      return { messageId: 'dev-mode', accepted: [to] };
    }

    // Verify transporter before sending
    try {
      await withRetry(() => transporter.verify(), 'transporter.verify before send');
      logger.smtp('Transporter verified before send', { to, subject });
    } catch (err) {
      logger.smtp('Transporter verification failed', { to, subject, error: err.message, stack: err.stack });
      throw new Error(`SMTP verification failed: ${err.message}`);
    }

    const fromEmail = smtp.fromEmail || smtp.fromName ? smtp.fromEmail : smtp.username;
    const from = smtp.fromName ? `"${smtp.fromName}" <${fromEmail || smtp.username}>` : fromEmail || smtp.username;

    const result = await withRetry(
      () =>
        transporter.sendMail({
          from,
          to,
          replyTo: smtp.replyTo || fromEmail,
          subject,
          text,
          html: html || text,
        }),
      'sendMail'
    );

    logger.smtp('Email sent successfully', { to, subject, messageId: result.messageId });
    return result;
  },

  async testConnection(testEmail, smtpOverride = null) {
    try {
      const { transporter, smtp } = await createTransporter(smtpOverride);
      if (!transporter) {
        return { success: false, message: '❌ SMTP Authentication Failed — not configured' };
      }

      await withRetry(() => transporter.verify(), 'SMTP test verify');

      if (testEmail) {
        await this.sendWithConfig({
          to: testEmail,
          subject: 'Expro Group - SMTP Test',
          text: '✓ SMTP Connected Successfully',
          html: templates.smtpTest(),
          smtpOverride,
        });
      }

      return { success: true, message: '✓ SMTP Connected Successfully' };
    } catch (err) {
      logger.smtp('SMTP test failed', { error: err.message });
      return { success: false, message: `❌ SMTP Authentication Failed — ${err.message}` };
    }
  },

  async sendOtpEmail(to, otp, purpose = 'verification') {
    const smtp = await settingsService.getEffectiveSmtpConfig();
    if (!smtp.enabled || !smtp.enableOtp) {
      if (!env.isProduction) {
        logger.smtp('DEV OTP', { to, otp, purpose });
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
      logger.warn('smtp', 'Contact form admin notification skipped — SMTP disabled');
      return null;
    }

    const settings = await settingsService.getSettings(true);
    const recipients = settings.contact.notificationEmails || [];
    if (!recipients.length) {
      logger.warn('smtp', 'No notification emails configured');
      return null;
    }

    const subject = `Contact Form: ${messageData.subject}`;
    const html = templates.contactForm(messageData);
    const text = `From: ${messageData.name} (${messageData.email})\nSubject: ${messageData.subject}\n\n${messageData.message}`;

    return Promise.all(
      recipients.map((to) =>
        this.sendWithConfig({ to, subject, text, html }).catch((err) => {
          logger.error('Contact notification failed', { to, error: err.message });
          return null;
        })
      )
    );
  },

  async sendContactConfirmation(messageData) {
    const smtp = await settingsService.getEffectiveSmtpConfig();
    if (!smtp.enabled) return null;

    return this.sendWithConfig({
      to: messageData.email,
      subject: 'Expro Group - We received your message',
      text: `Hi ${messageData.name},\n\nThank you for contacting Expro Group. We received your message and will respond shortly.\n\nSubject: ${messageData.subject}`,
      html: templates.contactConfirmation(messageData),
    });
  },

  async sendAdminInvitation({ to, fullName, username, tempPassword, loginUrl }) {
    const smtp = await settingsService.getEffectiveSmtpConfig();
    if (!smtp.enabled) {
      logger.warn('smtp', 'Admin invitation skipped — SMTP disabled', { to });
      return null;
    }

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
