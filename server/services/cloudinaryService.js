import { v2 as cloudinary } from 'cloudinary';
import env from '../config/env.js';
import settingsService from './settingsService.js';
import logger from './logger.js';

let configured = false;
let startupStatus = { verified: false, message: 'Not verified yet' };

const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return match ? match[1] : null;
};

export const cloudinaryService = {
  getStartupStatus() {
    return startupStatus;
  },

  configure() {
    const cfg = env.cloudinary;
    if (cfg.cloudName && cfg.apiKey && cfg.apiSecret) {
      cloudinary.config({
        cloud_name: cfg.cloudName,
        api_key: cfg.apiKey,
        api_secret: cfg.apiSecret,
        secure: true,
      });
      configured = true;
      return true;
    }
    configured = false;
    return false;
  },

  async verifyOnStartup() {
    this.configure();
    if (!configured) {
      startupStatus = {
        verified: false,
        message: '❌ Cloudinary Failed — Missing CLOUDINARY_CLOUD_NAME, API_KEY, or API_SECRET',
      };
      logger.warn('upload', startupStatus.message);
      console.log(startupStatus.message);
      return startupStatus;
    }

    try {
      await cloudinary.api.ping();
      startupStatus = {
        verified: true,
        message: '✓ Cloudinary Connected',
        cloudName: env.cloudinary.cloudName,
      };
      logger.info('upload', '✓ Cloudinary Connected', { cloud: env.cloudinary.cloudName });
      console.log('✓ Cloudinary Connected');
      return startupStatus;
    } catch (err) {
      startupStatus = {
        verified: false,
        message: `❌ Cloudinary Failed — ${err.message}`,
      };
      logger.error('Cloudinary startup failed', { error: err.message });
      console.error(startupStatus.message);
      return startupStatus;
    }
  },

  isConfigured() {
    return configured;
  },

  async uploadBuffer(buffer, options = {}) {
    if (!this.configure()) {
      throw new Error('Cloudinary is not configured');
    }

    const folder = options.folder || 'expro';
    const transformation = options.thumbnail
      ? [{ width: 400, height: 400, crop: 'limit' }, { quality: 'auto', fetch_format: 'webp' }]
      : [{ quality: 'auto', fetch_format: 'webp' }];

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation,
          ...options.uploadOptions,
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
      stream.end(buffer);
    });
  },

  async uploadFromMulter(file, folder = 'expro') {
    if (!file?.buffer) throw new Error('No file buffer');
    const result = await this.uploadBuffer(file.buffer, { folder });
    logger.upload(result.public_id, file.mimetype, '', 'cloudinary');
    return {
      url: result.secure_url,
      publicId: result.public_id,
      thumbnail: cloudinary.url(result.public_id, {
        transformation: [{ width: 400, height: 400, crop: 'limit' }, { quality: 'auto', fetch_format: 'webp' }],
        secure: true,
      }),
    };
  },

  async deleteByUrl(url) {
    const publicId = extractPublicId(url);
    if (!publicId || !this.configure()) return false;
    try {
      await cloudinary.uploader.destroy(publicId);
      logger.info('upload', 'Cloudinary image deleted', { publicId });
      return true;
    } catch (err) {
      logger.warn('upload', 'Cloudinary delete failed', { publicId, error: err.message });
      return false;
    }
  },
};

export default cloudinaryService;
