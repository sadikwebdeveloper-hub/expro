import db from '../database/index.js';
import mailService from '../services/mailService.js';
import cloudinaryService from '../services/cloudinaryService.js';
import { sendSuccess } from '../utils/response.js';

export const dashboardController = {
  async getStats(req, res) {
    const data = await db.getAll();
    const smtp = mailService.getStartupStatus();
    const cloudinary = cloudinaryService.getStartupStatus();

    const recentMessages = (data.messages || []).slice(0, 5);
    const recentLogs = (data.auditLogs || []).slice(0, 10);

    return sendSuccess(res, 'Dashboard stats retrieved', {
      counts: {
        visitors: (data.visitors || []).length,
        admins: (data.users || []).length,
        messages: (data.messages || []).length,
        products: (data.products || []).length,
        subsidiaries: (data.companies || []).length,
        news: (data.news || []).length,
      },
      system: {
        smtp,
        cloudinary,
        nodeEnv: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
      },
      recentMessages,
      recentActivity: recentLogs,
    });
  },
};

export default dashboardController;
