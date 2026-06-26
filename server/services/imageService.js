import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { UPLOADS_DIR } from '../config/upload.js';

const BRANDING_DIR = path.join(UPLOADS_DIR, 'branding');

if (!fs.existsSync(BRANDING_DIR)) {
  fs.mkdirSync(BRANDING_DIR, { recursive: true });
}

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);

export const imageService = {
  async processBrandingUpload(file, type = 'logo', previousUrl = '') {
    if (!file) return previousUrl;
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      throw new Error('Invalid image type');
    }

    if (previousUrl && previousUrl.startsWith('/uploads/')) {
      const relative = previousUrl.replace(/^\/uploads\//, '');
      const resolved = path.join(UPLOADS_DIR, relative);
      if (fs.existsSync(resolved)) {
        fs.unlinkSync(resolved);
      }
    }

    const ext = file.mimetype === 'image/svg+xml' ? '.svg' : '.webp';
    const filename = `${type}-${Date.now()}${ext}`;
    const outputPath = path.join(BRANDING_DIR, filename);

    if (file.mimetype === 'image/svg+xml') {
      fs.copyFileSync(file.path, outputPath);
      fs.unlinkSync(file.path);
    } else {
      const maxWidth = type === 'favicon' ? 128 : 512;
      await sharp(file.path)
        .resize(maxWidth, maxWidth, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outputPath);
      fs.unlinkSync(file.path);
    }

    return `/uploads/branding/${filename}`;
  },
};

export default imageService;
