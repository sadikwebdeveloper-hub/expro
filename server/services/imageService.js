import cloudinaryService from './cloudinaryService.js';

const FOLDER_MAP = {
  companies: 'expro/companies',
  products: 'expro/products',
  news: 'expro/news',
  media: 'expro/media',
  partners: 'expro/partners',
  logo: 'expro/branding',
  favicon: 'expro/branding',
  avatar: 'expro/avatars',
};

export const imageService = {
  async upload(file, type = 'products', previousUrl = '') {
    if (!file) return { url: previousUrl, thumbnail: previousUrl };

    if (previousUrl) {
      await cloudinaryService.deleteByUrl(previousUrl);
    }

    const folder = FOLDER_MAP[type] || 'expro/uploads';
    const result = await cloudinaryService.uploadFromMulter(file, folder);
    return { url: result.url, thumbnail: result.thumbnail, publicId: result.publicId };
  },

  async delete(url) {
    return cloudinaryService.deleteByUrl(url);
  },
};

export default imageService;
