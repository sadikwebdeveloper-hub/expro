import db from '../database/index.js';
import authService from '../services/authService.js';
import adminService from '../services/adminService.js';
import otpService from '../services/otpService.js';
import settingsService from '../services/settingsService.js';
import mailService from '../services/mailService.js';
import imageService from '../services/imageService.js';
import cloudinaryService from '../services/cloudinaryService.js';
import { UAParser } from 'ua-parser-js';
import { sendSuccess, sendError, stripPassword, stripPasswords } from '../utils/response.js';
import { sanitizeObject } from '../utils/sanitize.js';
import logger from '../services/logger.js';

const PUBLIC_GET_KEYS = [
  'config', 'slides', 'about', 'companies', 'products', 'news', 'media',
  'achievements', 'partners', 'services', 'directors',
];

const ADMIN_GET_KEYS = ['messages', 'visitors', 'users'];

const uploadFile = async (file, folder, previousUrl = '') => {
  if (!file) return previousUrl;
  const result = await imageService.upload(file, folder, previousUrl);
  return result.url;
};

export const contentController = {
  async getPublicCollection(req, res) {
    const { key } = req.params;
    const data = await db.getAll();
    const value = data[key] || (key === 'config' || key === 'about' ? {} : []);
    return sendSuccess(res, `${key} retrieved`, value);
  },

  async getAdminCollection(req, res) {
    const { key } = req.params;
    const data = await db.getAll();
    if (key === 'users') {
      return sendSuccess(res, 'Users retrieved', stripPasswords(data.users || []));
    }
    return sendSuccess(res, `${key} retrieved`, data[key] || []);
  },

  async updateConfig(req, res) {
    const data = await db.getAll();
    data.config = { ...data.config, ...sanitizeObject(req.body) };
    await db.save(data);
    return sendSuccess(res, 'Config updated', data.config);
  },

  async updateSlides(req, res) {
    const data = await db.getAll();
    data.slides = req.body;
    await db.save(data);
    return sendSuccess(res, 'Slides updated', data.slides);
  },

  async updateAbout(req, res) {
    const data = await db.getAll();
    data.about = { ...data.about, ...sanitizeObject(req.body) };
    await db.save(data);
    return sendSuccess(res, 'About content updated', data.about);
  },

  async updateServices(req, res) {
    const data = await db.getAll();
    data.services = req.body;
    await db.save(data);
    return sendSuccess(res, 'Services updated', data.services);
  },

  async updateListItem(req, res) {
    const { key, id } = req.params;
    const data = await db.getAll();
    const numericId = parseInt(id, 10);
    const idx = (data[key] || []).findIndex((item) => item.id === numericId);
    if (idx === -1) return sendError(res, 'Item not found', 404);
    data[key][idx] = { ...data[key][idx], ...sanitizeObject(req.body) };
    await db.save(data);
    return sendSuccess(res, 'Item updated', data[key][idx]);
  },

  async createWithUpload(req, res, key) {
    const data = await db.getAll();
    const imageUrl = await uploadFile(req.file, key, '');
    const item = {
      id: Date.now(),
      ...sanitizeObject(req.body),
      ...(key !== 'partners' && key !== 'achievements' && key !== 'directors' ? { image: imageUrl } : {}),
    };
    if (key === 'partners' && req.file) item.logo = imageUrl;
    if (!data[key]) data[key] = [];
    data[key].unshift(item);
    await db.save(data);
    return sendSuccess(res, 'Item created', item, 201);
  },

  async updateWithUpload(req, res, key) {
    const data = await db.getAll();
    const numericId = parseInt(req.params.id, 10);
    const idx = (data[key] || []).findIndex((item) => item.id === numericId);
    if (idx === -1) return sendError(res, 'Item not found', 404);

    const imageField = key === 'partners' ? 'logo' : 'image';
    const existingImage = data[key][idx][imageField] || data[key][idx].image || '';
    const imageUrl = await uploadFile(req.file, key, req.file ? existingImage : existingImage);

    data[key][idx] = {
      ...data[key][idx],
      ...sanitizeObject(req.body),
      [imageField]: imageUrl,
    };
    await db.save(data);
    return sendSuccess(res, 'Item updated', data[key][idx]);
  },

  async simpleCreate(req, res, key) {
    const data = await db.getAll();
    const item = { id: Date.now(), ...sanitizeObject(req.body) };
    if (key === 'users') {
      if (!item.password) return sendError(res, 'Password is required', 400);
      try {
        const created = await authService.addUser(item);
        return sendSuccess(res, 'User created', created, 201);
      } catch (err) {
        return sendError(res, err.message, 400, err.message);
      }
    }
    if (!data[key]) data[key] = [];
    data[key].unshift(item);
    await db.save(data);
    return sendSuccess(res, 'Item created', item, 201);
  },

  async createMessage(req, res) {
    const data = await db.getAll();
    const item = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...sanitizeObject(req.body, 2000),
    };
    if (!data.messages) data.messages = [];
    data.messages.unshift(item);
    await db.save(data);

    const payload = { ...item, date: new Date().toLocaleString() };

    try {
      await mailService.sendContactFormNotification(payload);
      await mailService.sendContactConfirmation(payload);
    } catch (err) {
      logger.error('Contact email failed', { error: err.message });
    }

    return sendSuccess(res, 'Message sent successfully', { success: true });
  },

  async trackVisit(req, res) {
    const ua = new UAParser(req.headers['user-agent'] || '');
    const parsed = ua.getResult();
    const data = await db.getAll();

    const item = {
      id: Date.now(),
      ip: req.ip,
      country: req.headers['cf-ipcountry'] || req.headers['x-country'] || 'Unknown',
      city: req.headers['cf-ipcity'] || 'Unknown',
      browser: `${parsed.browser.name || 'Unknown'} ${parsed.browser.version || ''}`.trim(),
      os: `${parsed.os.name || 'Unknown'} ${parsed.os.version || ''}`.trim(),
      device: parsed.device.type || 'desktop',
      userAgent: req.headers['user-agent'] || '',
      page: req.body?.page || req.headers.referer || '/',
      referrer: req.headers.referer || '',
      date: new Date().toISOString(),
    };

    if (!data.visitors) data.visitors = [];
    data.visitors.unshift(item);
    if (data.visitors.length > 1000) data.visitors = data.visitors.slice(0, 1000);
    await db.save(data);
    return sendSuccess(res, 'Visit tracked', { success: true });
  },

  async deleteItem(req, res) {
    const { key, id } = req.params;
    const numericId = parseInt(id, 10);
    const data = await db.getAll();
    const item = (data[key] || []).find((i) => i.id === numericId);

    if (item) {
      const url = item.image || item.logo;
      if (url) await cloudinaryService.deleteByUrl(url);
    }

    await db.update(async (d) => {
      if (d[key]) d[key] = d[key].filter((i) => i.id !== numericId);
      return d;
    });

    return sendSuccess(res, 'Item deleted', { success: true });
  },
};

export { PUBLIC_GET_KEYS, ADMIN_GET_KEYS };
