import nodemailer from 'nodemailer';
import net from 'net';
import env from '../config/env.js';
import settingsService from './settingsService.js';
import templates from './mailTemplates.js';
import logger from './logger.js';
import { resolveHostAddresses, pickReachableAddress, clearDnsCache } from './dnsResolver.js';

const SMTP_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1200;

let startupStatus = { verified: false, message: 'Not verified yet', lastCheck: null };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * nodemailer derives TLS mode from the port, but honour the admin's explicit
 * "encryption" choice first so a host on a non-standard port still works.
 */
const resolveSecure = (smtp, port) => {
  const encryption = String(smtp.encryption || '').toUpperCase();
  if (encryption === 'SSL') return true;
  if (encryption === 'TLS' || encryption === 'STARTTLS') return false;
  if (encryption === 'NONE') return false;
  return port === 465;
};

const buildTransportOptions = ({ smtp, host, servername }) => {
  const port = Number(smtp.port) || 587;
  const secure = resolveSecure(smtp, port);
  const encryption = String(smtp.encryption || '').toUpperCase();
  const useTls = encryption !== 'NONE';
  const username = smtp.username || smtp.user;
  const password = smtp.password || smtp.pass;

  // SNI must carry a domain name (RFC 6066). When the configured host is already
  // an IP there is no name to present, and setting one triggers a deprecation
  // warning, so leave servername out entirely in that case.
  const sniName = servername && net.isIP(servername) === 0 ? servername : undefined;

  const options = {
    // A resolved IP literal. nodemailer's resolveHostname() short-circuits for IP
    // literals, which skips the random A/AAAA pick that breaks on IPv6-less hosts.
    host,
    port,
    secure,
    auth: { user: username, pass: password },
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
    tls: {
      minVersion: 'TLSv1.2',
      // Certificate hostname stays the real domain, not the pinned IP.
      ...(sniName ? { servername: sniName } : {}),
      rejectUnauthorized: true,
    },
  };

  // STARTTLS mode: advertise that a secure channel is required before sending.
  if (!secure && useTls) options.requireTLS = true;

  logger.smtp('SMTP transport built', {
    servername: sniName || host,
    host,
    port,
    secure,
    requireTls: options.requireTLS ?? false,
    username,
    passwordLength: (password || '').length,
  });

  return options;
};

const resolveSmtp = async (override = null) => {
  if (override) {
    return {
      ...override,
      username: override.username || override.user,
      password: override.password || override.pass,
    };
  }
  return settingsService.getEffectiveSmtpConfig();
};

const missingCredentials = (smtp) => ({
  host: Boolean(smtp.host),
  username: Boolean(smtp.username),
  password: Boolean(smtp.password),
});

/**
 * Build a transporter that is pinned to a reachable IPv4 address.
 * Falls back to the next candidate address when one refuses the connection.
 */
const createTransporter = async (smtpOverride = null) => {
  const smtp = await resolveSmtp(smtpOverride);
  const source = smtpOverride ? 'OVERRIDE' : env.smtp.host && env.smtp.user ? 'ENV_FALLBACK' : 'DATABASE';

  if (!smtp.host || !smtp.username || !smtp.password) {
    logger.smtp('SMTP configuration incomplete', { source, ...missingCredentials(smtp) });
    return { transporter: null, smtp, host: null };
  }

  const { addresses } = await resolveHostAddresses(smtp.host, { allowIpv6: false });
  const host = await pickReachableAddress(addresses, Number(smtp.port) || 587);

  logger.smtp('SMTP host pinned', {
    source,
    servername: smtp.host,
    host,
    candidates: addresses.length,
  });

  const transporter = nodemailer.createTransport(
    buildTransportOptions({ smtp, host, servername: smtp.host })
  );

  return { transporter, smtp: { ...smtp }, host };
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

/**
 * Run an operation, rebuilding the transporter against the next candidate address
 * whenever the failure is a transport-level one (ENETUNREACH / ETIMEDOUT / ECONNREFUSED).
 */
const withAddressFailover = async (smtpOverride, operation, label) => {
  const smtp = await resolveSmtp(smtpOverride);
  if (!smtp.host || !smtp.username || !smtp.password) {
    throw Object.assign(new Error('SMTP is not fully configured'), { code: 'ENOCONFIG' });
  }

  const { addresses } = await resolveHostAddresses(smtp.host, { allowIpv6: false });
  const candidates = addresses.filter((a) => a && !a.startsWith('::'));
  const list = candidates.length ? candidates : [smtp.host];

  let lastError;
  for (let index = 0; index < list.length; index++) {
    const host = list[index];
    try {
      const transporter = nodemailer.createTransport(
        buildTransportOptions({ smtp, host, servername: smtp.host })
      );
      return await withRetry(() => operation(transporter, smtp), label);
    } catch (err) {
      lastError = err;
      const transportLevel = ['ESOCKET', 'ETIMEDOUT', 'ECONNECTION', 'EDNS', 'ENETUNREACH'].includes(
        err.code
      );
      logger.smtp(`${label} failed on ${host}`, { error: err.message, code: err.code });
      // Auth or message errors will not improve on another address.
      if (!transportLevel || index === list.length - 1) break;
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
          message: '❌ SMTP disabled in settings',
          lastCheck: new Date().toISOString(),
        };
        console.log(startupStatus.message);
        return startupStatus;
      }

      const creds = missingCredentials(smtp);
      if (!creds.host || !creds.username || !creds.password) {
        startupStatus = {
          verified: false,
          message: '❌ SMTP not configured — missing host, username or password',
          lastCheck: new Date().toISOString(),
        };
        console.log(startupStatus.message);
        return startupStatus;
      }

      const host = await withAddressFailover(
        null,
        (transporter) => transporter.verify().then(() => true),
        'SMTP startup verify'
      );

      startupStatus = {
        verified: true,
        message: `✓ SMTP Connected (${smtp.host}:${smtp.port})`,
        lastCheck: new Date().toISOString(),
        host: smtp.host,
        port: smtp.port,
      };
      console.log(startupStatus.message);
      return startupStatus;
    } catch (err) {
      startupStatus = {
        verified: false,
        message: `❌ SMTP Failed — ${err.message}`,
        lastCheck: new Date().toISOString(),
        error: err.message,
      };
      logger.smtp(startupStatus.message, { error: err.message, code: err.code });
      console.error(startupStatus.message);
      return startupStatus;
    }
  },

  async isConfigured() {
    const smtp = await settingsService.getEffectiveSmtpConfig();
    return Boolean(smtp.enabled && smtp.host && smtp.username && smtp.password);
  },

  /**
   * Send a single message. Resolves to a result object that always reports the
   * truth about delivery, so callers can surface real failures to the user.
   */
  async sendWithConfig({ to, subject, text, html, smtpOverride = null }) {
    const smtp = await resolveSmtp(smtpOverride);

    if (!smtp.host || !smtp.username || !smtp.password) {
      if (env.isProduction) {
        throw new Error('Email service is not configured');
      }
      logger.warn('smtp', 'DEV MODE — SMTP unconfigured, skipping send', { to, subject });
      return { delivered: false, devMode: true, messageId: null, to, subject };
    }

    const fromEmail = smtp.fromEmail || smtp.username;
    const from = smtp.fromName ? `"${smtp.fromName}" <${fromEmail}>` : fromEmail;

    const result = await withAddressFailover(
      smtpOverride,
      (transporter) =>
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

    logger.smtp('Email sent', { to, subject, messageId: result.messageId });
    return {
      delivered: true,
      devMode: false,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      to,
      subject,
    };
  },

  async testConnection(testEmail, smtpOverride = null) {
    try {
      await withAddressFailover(
        smtpOverride,
        (transporter) => transporter.verify().then(() => true),
        'SMTP test verify'
      );

      if (testEmail) {
        await this.sendWithConfig({
          to: testEmail,
          subject: 'Expro Group — SMTP Test',
          text: 'SMTP connection verified successfully.',
          html: templates.smtpTest(),
          smtpOverride,
        });
      }

      const smtp = await resolveSmtp(smtpOverride);
      return {
        success: true,
        message: `✓ SMTP Connected (${smtp.host}:${smtp.port})`,
      };
    } catch (err) {
      logger.smtp('SMTP test failed', { error: err.message, code: err.code });
      return { success: false, message: `❌ SMTP failed — ${err.message}` };
    }
  },

  async sendOtpEmail(to, otp, purpose = 'verification') {
    const smtp = await settingsService.getEffectiveSmtpConfig();
    if (!smtp.enabled || !smtp.enableOtp) {
      if (!env.isProduction) {
        logger.smtp('DEV OTP', { to, otp, purpose });
        return { delivered: false, devMode: true };
      }
      throw new Error('OTP email is disabled');
    }

    const subject =
      purpose === 'reset'
        ? 'Expro Group — Password Reset Code'
        : 'Expro Group — Verification Code';

    return this.sendWithConfig({
      to,
      subject,
      text: `Your code is ${otp}. It expires in 5 minutes.`,
      html: templates.otp(otp, purpose),
    });
  },

  /**
   * Notify every configured admin address. Returns a per-recipient breakdown so
   * the contact endpoint can tell the caller whether mail actually left the box.
   */
  async sendContactFormNotification(messageData) {
    const smtp = await settingsService.getEffectiveSmtpConfig();
    if (!smtp.enabled || !smtp.enableContactForm) {
      logger.warn('smtp', 'Contact notification skipped — SMTP or contact mail disabled');
      return { attempted: 0, delivered: 0, failed: 0, skipped: true, results: [] };
    }

    const settings = await settingsService.getSettings(true);
    const recipients = (settings.contact.notificationEmails || []).filter(Boolean);
    if (!recipients.length) {
      logger.warn('smtp', 'No notification emails configured');
      return { attempted: 0, delivered: 0, failed: 0, skipped: true, results: [] };
    }

    const subject = `Contact Form: ${messageData.subject}`;
    const html = templates.contactForm(messageData);
    const text = `From: ${messageData.name} (${messageData.email})\nSubject: ${messageData.subject}\n\n${messageData.message}`;

    const results = await Promise.all(
      recipients.map(async (to) => {
        try {
          await this.sendWithConfig({ to, subject, text, html });
          return { to, ok: true };
        } catch (err) {
          logger.error('Contact notification failed', { to, error: err.message });
          return { to, ok: false, error: err.message };
        }
      })
    );

    return {
      attempted: results.length,
      delivered: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      skipped: false,
      results,
    };
  },

  async sendContactConfirmation(messageData) {
    const smtp = await settingsService.getEffectiveSmtpConfig();
    if (!smtp.enabled) return { delivered: false, skipped: true };

    try {
      return await this.sendWithConfig({
        to: messageData.email,
        subject: 'Expro Group — We received your message',
        text: `Hi ${messageData.name},\n\nThank you for contacting Expro Group. We received your message and will respond shortly.\n\nSubject: ${messageData.subject}`,
        html: templates.contactConfirmation(messageData),
      });
    } catch (err) {
      logger.error('Contact confirmation failed', { to: messageData.email, error: err.message });
      return { delivered: false, error: err.message };
    }
  },

  async sendAdminInvitation({ to, fullName, username, tempPassword, loginUrl }) {
    const smtp = await settingsService.getEffectiveSmtpConfig();
    if (!smtp.enabled) {
      logger.warn('smtp', 'Admin invitation skipped — SMTP disabled', { to });
      return null;
    }

    return this.sendWithConfig({
      to,
      subject: 'Expro Group — Admin Account Invitation',
      text: `Username: ${username}\nTemporary Password: ${tempPassword}\nLogin: ${loginUrl}`,
      html: templates.adminInvitation({ fullName, username, tempPassword, loginUrl }),
    });
  },

  async sendWelcomeEmail({ to, fullName }) {
    const smtp = await settingsService.getEffectiveSmtpConfig();
    if (!smtp.enabled || !smtp.enableWelcome) return null;

    return this.sendWithConfig({
      to,
      subject: 'Welcome to Expro Group',
      text: `Welcome ${fullName}!`,
      html: templates.welcome({ fullName }),
    });
  },

  clearDnsCache,
};

export default mailService;
