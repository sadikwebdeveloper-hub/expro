import env from '../config/env.js';
import db from '../database/index.js';
import { encryptSecret, decryptSecret, maskSecret } from './cryptoService.js';

const DEFAULT_SETTINGS = {
  general: {
    websiteName: 'Expro Group',
    timezone: 'Asia/Dhaka',
    currency: 'BDT',
    language: 'en',
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back soon.',
  },
  contact: {
    phone: '+880 1712 345678',
    email: 'info@exprogroup.com',
    supportEmail: 'support@exprogroup.com',
    address: 'Expro Tower, Gulshan-2, Dhaka-1212, Bangladesh',
    mapUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.5983460988937!2d90.4190289759715!3d23.797313086973347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7a0f443577d%3A0x6e65e656d0d21658!2sGulshan%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1714567890123!5m2!1sen!2sbd',
    notificationEmails: ['admin@exprogroup.com'],
  },
  branding: {
    logoUrl: 'https://nexalite-org.github.io/storage/logo.png',
    faviconUrl: '',
  },
  social: {
    facebook: '#',
    instagram: '',
    linkedin: '#',
    twitter: '',
    youtube: '#',
    whatsapp: '',
    telegram: '',
    messenger: '',
  },
  seo: {
    metaTitle: 'Expro Group - Legacy of Excellence',
    metaDescription: 'Leading conglomerate committed to sustainable development and quality.',
    keywords: 'expro, group, bangladesh, industry',
    googleAnalyticsId: '',
    facebookPixelId: '',
  },
  footer: {
    copyright:
      'We are a conglomerate committed to sustainable development, transparency, and quality.',
  },
  smtp: {
    host: '',
    port: 587,
    username: '',
    passwordEncrypted: '',
    encryption: 'TLS',
    fromEmail: '',
    fromName: 'Expro Group',
    replyTo: '',
    enabled: false,
    enableContactForm: true,
    enableOtp: true,
    enableForgotPassword: true,
    enableWelcome: true,
  },
  cloudinary: {
    enabled: Boolean(env.cloudinary?.cloudName),
    cloudName: env.cloudinary?.cloudName || '',
  },
  otp: {
    length: 6,
    expiryMinutes: 5,
    maxAttempts: 5,
    cooldownSeconds: 60,
  },
  security: {
    maxLoginAttempts: 5,
    sessionHours: 24,
    rememberMeDays: 30,
  },
};

const envSmtpDefaults = () => ({
  host: env.smtp.host || '',
  port: env.smtp.port || 587,
  username: env.smtp.user || '',
  passwordEncrypted: env.smtp.pass ? encryptSecret(env.smtp.pass.trim()) : '',
  fromEmail: env.smtp.fromEmail || env.smtp.user || '',
  fromName: env.smtp.fromName || 'Expro Group',
  replyTo: env.smtp.replyTo || env.smtp.fromEmail || '',
  enabled: Boolean(env.smtp.host && env.smtp.user && env.smtp.pass),
});

const migrateFromLegacyConfig = (config = {}) => ({
  contact: {
    phone: config.phone || DEFAULT_SETTINGS.contact.phone,
    email: config.email || DEFAULT_SETTINGS.contact.email,
    supportEmail: config.supportEmail || config.email || DEFAULT_SETTINGS.contact.supportEmail,
    address: config.address || DEFAULT_SETTINGS.contact.address,
    mapUrl: config.mapUrl || DEFAULT_SETTINGS.contact.mapUrl,
    notificationEmails: config.notificationEmails || DEFAULT_SETTINGS.contact.notificationEmails,
  },
  branding: {
    logoUrl: config.logoUrl || DEFAULT_SETTINGS.branding.logoUrl,
    faviconUrl: config.faviconUrl || '',
  },
  social: {
    facebook: config.facebookUrl || config.facebook || DEFAULT_SETTINGS.social.facebook,
    instagram: config.instagramUrl || config.instagram || '',
    linkedin: config.linkedinUrl || config.linkedin || DEFAULT_SETTINGS.social.linkedin,
    twitter: config.twitterUrl || config.twitter || '',
    youtube: config.youtubeUrl || config.youtube || DEFAULT_SETTINGS.social.youtube,
    whatsapp: config.whatsappUrl || config.whatsapp || '',
    telegram: config.telegramUrl || config.telegram || '',
    messenger: config.messengerUrl || config.messenger || '',
  },
  footer: {
    copyright: config.footerText || DEFAULT_SETTINGS.footer.copyright,
  },
  seo: {
    metaTitle: config.metaTitle || DEFAULT_SETTINGS.seo.metaTitle,
    metaDescription: config.metaDescription || DEFAULT_SETTINGS.seo.metaDescription,
    keywords: config.keywords || DEFAULT_SETTINGS.seo.keywords,
    googleAnalyticsId: config.googleAnalyticsId || '',
    facebookPixelId: config.facebookPixelId || '',
  },
});

const deepMerge = (base, patch) => {
  const result = { ...base };
  for (const key of Object.keys(patch || {})) {
    if (patch[key] && typeof patch[key] === 'object' && !Array.isArray(patch[key])) {
      result[key] = deepMerge(base[key] || {}, patch[key]);
    } else if (patch[key] !== undefined) {
      result[key] = patch[key];
    }
  }
  return result;
};

export const settingsService = {
  async ensureSettings() {
    const data = await db.getAll();

    if (!data.settings) {
      const legacy = migrateFromLegacyConfig(data.config);
      data.settings = deepMerge(deepMerge(DEFAULT_SETTINGS, legacy), {
        smtp: deepMerge(envSmtpDefaults(), DEFAULT_SETTINGS.smtp),
      });
      await this.syncPublicConfig(data);
      await db.save(data);
    }

    return data.settings;
  },

  syncPublicConfig(data) {
    const s = data.settings;
    data.config = {
      ...(data.config || {}),
      logoUrl: s.branding.logoUrl,
      faviconUrl: s.branding.faviconUrl,
      phone: s.contact.phone,
      email: s.contact.email,
      supportEmail: s.contact.supportEmail,
      address: s.contact.address,
      mapUrl: s.contact.mapUrl,
      notificationEmails: s.contact.notificationEmails,
      facebookUrl: s.social.facebook,
      instagramUrl: s.social.instagram,
      linkedinUrl: s.social.linkedin,
      twitterUrl: s.social.twitter,
      youtubeUrl: s.social.youtube,
      whatsappUrl: s.social.whatsapp,
      telegramUrl: s.social.telegram,
      messengerUrl: s.social.messenger,
      footerText: s.footer.copyright,
      metaTitle: s.seo.metaTitle,
      metaDescription: s.seo.metaDescription,
      keywords: s.seo.keywords,
      googleAnalyticsId: s.seo.googleAnalyticsId,
      facebookPixelId: s.seo.facebookPixelId,
      websiteName: s.general.websiteName,
      timezone: s.general.timezone,
      currency: s.general.currency,
      language: s.general.language,
      maintenanceMode: s.general.maintenanceMode,
      maintenanceMessage: s.general.maintenanceMessage,
    };
    return data.config;
  },

  maskSmtp(settings) {
    const masked = JSON.parse(JSON.stringify(settings));
    masked.smtp = {
      ...masked.smtp,
      passwordEncrypted: maskSecret(masked.smtp.passwordEncrypted),
      hasPassword: Boolean(masked.smtp.passwordEncrypted),
    };
    return masked;
  },

  async getSettings(includeSecrets = false) {
    await this.ensureSettings();
    const data = await db.getAll();
    return includeSecrets ? data.settings : this.maskSmtp(data.settings);
  },

  async getEffectiveSmtpConfig() {
    await this.ensureSettings();
    const data = await db.getAll();
    const dbSmtp = data.settings.smtp;
    const envDefaults = envSmtpDefaults();

    const merged = {
      host: dbSmtp.host || envDefaults.host,
      port: Number(dbSmtp.port || envDefaults.port || 587),
      username: dbSmtp.username || envDefaults.username,
      passwordEncrypted: dbSmtp.passwordEncrypted || envDefaults.passwordEncrypted,
      encryption: dbSmtp.encryption || 'TLS',
      fromEmail: dbSmtp.fromEmail || envDefaults.fromEmail,
      fromName: dbSmtp.fromName || 'Expro Group',
      replyTo: dbSmtp.replyTo || dbSmtp.fromEmail || envDefaults.replyTo,
      enabled: dbSmtp.enabled ?? envDefaults.enabled,
      enableContactForm: dbSmtp.enableContactForm ?? true,
      enableOtp: dbSmtp.enableOtp ?? true,
      enableForgotPassword: dbSmtp.enableForgotPassword ?? true,
      enableWelcome: dbSmtp.enableWelcome ?? true,
    };

    const password = merged.passwordEncrypted ? decryptSecret(merged.passwordEncrypted) : '';

    return { ...merged, password };
  },

  async updateSettings(updates, { smtpPassword } = {}) {
    await this.ensureSettings();

    let savedSettings = null;

    await db.update(async (data) => {
      const current = data.settings;

      if (updates.smtp) {
        const smtpUpdate = { ...updates.smtp };
        delete smtpUpdate.passwordEncrypted;
        delete smtpUpdate.hasPassword;

        if (smtpUpdate.password === '' || smtpUpdate.password === '••••••••') {
          delete smtpUpdate.password;
        }

        if (smtpPassword) {
          smtpUpdate.passwordEncrypted = encryptSecret(smtpPassword.trim());
        } else if (smtpUpdate.password === '') {
          smtpUpdate.passwordEncrypted = '';
        }

        delete smtpUpdate.password;
        updates.smtp = smtpUpdate;
      }

      if (updates.contact?.notificationEmails) {
        updates.contact.notificationEmails = [
          ...new Set(
            updates.contact.notificationEmails
              .map((e) => String(e).trim().toLowerCase())
              .filter(Boolean)
          ),
        ];
      }

      data.settings = deepMerge(current, updates);
      this.syncPublicConfig(data);
      savedSettings = this.maskSmtp(data.settings);
      return data;
    });

    return savedSettings;
  },

  async addNotificationEmail(email) {
    const normalized = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error('Invalid email format');
    }

    await this.ensureSettings();
    let emails = [];

    await db.update(async (data) => {
      if (!data.settings) data.settings = { ...DEFAULT_SETTINGS };
      const list = data.settings.contact.notificationEmails || [];
      if (list.includes(normalized)) {
        throw new Error('Email already exists');
      }
      data.settings.contact.notificationEmails = [...list, normalized];
      this.syncPublicConfig(data);
      emails = data.settings.contact.notificationEmails;
      return data;
    });

    return emails;
  },

  async removeNotificationEmail(email) {
    const normalized = String(email).trim().toLowerCase();
    let emails = [];

    await db.update(async (data) => {
      data.settings.contact.notificationEmails = (
        data.settings.contact.notificationEmails || []
      ).filter((e) => e !== normalized);
      settingsService.syncPublicConfig(data);
      emails = data.settings.contact.notificationEmails;
      return data;
    });

    return emails;
  },

  async updateNotificationEmail(oldEmail, newEmail) {
    const oldNorm = String(oldEmail).trim().toLowerCase();
    const newNorm = String(newEmail).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newNorm)) {
      throw new Error('Invalid email format');
    }

    let emails = [];

    await db.update(async (data) => {
      const list = data.settings.contact.notificationEmails || [];
      if (list.includes(newNorm) && newNorm !== oldNorm) {
        throw new Error('Email already exists');
      }
      data.settings.contact.notificationEmails = list.map((e) => (e === oldNorm ? newNorm : e));
      settingsService.syncPublicConfig(data);
      emails = data.settings.contact.notificationEmails;
      return data;
    });

    return emails;
  },
};

export default settingsService;
