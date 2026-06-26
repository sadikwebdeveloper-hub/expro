import db from '../database/index.js';

export const auditService = {
  async log(req, action, details = {}) {
    const actor = req.user || {};
    const entry = {
      id: Date.now(),
      adminId: actor.userId || null,
      adminUsername: actor.username || 'system',
      adminName: details.adminName || actor.fullName || actor.username || 'System',
      action,
      details: typeof details === 'string' ? { message: details } : details,
      ip: req.ip || '',
      browser: req.headers['user-agent'] || '',
      timestamp: new Date().toISOString(),
    };

    await db.update(async (data) => {
      if (!data.auditLogs) data.auditLogs = [];
      data.auditLogs.unshift(entry);
      if (data.auditLogs.length > 500) {
        data.auditLogs = data.auditLogs.slice(0, 500);
      }
      return data;
    });

    return entry;
  },

  async getLogs(limit = 100) {
    const data = await db.getAll();
    return (data.auditLogs || []).slice(0, limit);
  },
};

export default auditService;
