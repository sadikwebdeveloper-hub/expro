import crypto from 'crypto';
import db from '../database/index.js';
import authService from './authService.js';
import mailService from './mailService.js';
import auditService from './auditService.js';
import settingsService from './settingsService.js';
import { DEFAULT_ROLE_PERMISSIONS, ROLES } from '../config/permissions.js';
import { stripPassword } from '../utils/response.js';
import env from '../config/env.js';

const generateTempPassword = () => crypto.randomBytes(4).toString('hex') + 'A1!';

export const adminService = {
  async getAllAdmins(options = {}) {
    const { search = '', role = '', status = '', page = 1, limit = 20, sort = 'createdAt' } = options;
    const data = await db.getAll();
    let users = (data.users || []).map((user) => stripPassword(this.normalizeAdmin(user)));

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }
    if (role) users = users.filter((u) => u.role === role);
    if (status) users = users.filter((u) => u.status === status);

    users.sort((a, b) => {
      if (sort === 'name') return (a.fullName || '').localeCompare(b.fullName || '');
      if (sort === 'role') return (a.role || '').localeCompare(b.role || '');
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    const total = users.length;
    const start = (page - 1) * limit;
    const items = users.slice(start, start + limit);

    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  },

  normalizeAdmin(user) {
    return {
      ...user,
      status: user.status || 'active',
      permissions: user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || {},
      forcePasswordChange: Boolean(user.forcePasswordChange),
      loginHistory: user.loginHistory || [],
      failedLoginAttempts: user.failedLoginAttempts || 0,
    };
  },

  async findById(id) {
    const data = await db.getAll();
    const user = (data.users || []).find((u) => u.id === Number(id));
    return user ? stripPassword(this.normalizeAdmin(user)) : null;
  },

  async findRawById(id) {
    const data = await db.getAll();
    return (data.users || []).find((u) => u.id === Number(id)) || null;
  },

  async createAdmin(req, payload) {
    const { username, fullName, email, role, permissions, sendInvitation = true } = payload;

    if (!ROLES.includes(role)) {
      throw new Error('Invalid role');
    }

    const data = await db.getAll();
    if ((data.users || []).some((u) => u.username === username)) {
      throw new Error('Username already exists');
    }
    if ((data.users || []).some((u) => u.email?.toLowerCase() === email?.toLowerCase())) {
      throw new Error('Email already exists');
    }

    const tempPassword = payload.password || generateTempPassword();
    const hashedPassword = await authService.hashPassword(tempPassword);

    const admin = {
      id: Date.now(),
      username,
      fullName,
      email,
      role,
      password: hashedPassword,
      status: 'active',
      permissions: permissions || DEFAULT_ROLE_PERMISSIONS[role] || {},
      forcePasswordChange: true,
      failedLoginAttempts: 0,
      loginHistory: [],
      createdAt: new Date().toISOString(),
      createdBy: req.user?.username || 'system',
    };

    await db.update(async (d) => {
      if (!d.users) d.users = [];
      d.users.unshift(admin);
      return d;
    });

    const safeAdmin = stripPassword(this.normalizeAdmin(admin));

    if (sendInvitation) {
      const smtp = await settingsService.getEffectiveSmtpConfig();
      if (smtp.enabled && smtp.enableWelcome !== false) {
        await mailService.sendAdminInvitation({
          to: email,
          fullName,
          username,
          tempPassword,
          loginUrl: `${env.appUrl}/#/admin/login`,
        });
      }
    }

    await auditService.log(req, 'Admin Created', {
      adminName: safeAdmin.fullName,
      targetId: admin.id,
      targetUsername: username,
      role,
    });

    return safeAdmin;
  },

  async updateAdmin(req, id, updates) {
    const numericId = Number(id);
    let updated = null;

    await db.update(async (data) => {
      const idx = (data.users || []).findIndex((u) => u.id === numericId);
      if (idx === -1) throw new Error('Admin not found');

      const { password, ...safeUpdates } = updates;

      if (safeUpdates.role && !ROLES.includes(safeUpdates.role)) {
        throw new Error('Invalid role');
      }

      if (safeUpdates.username) {
        const exists = data.users.some(
          (u) => u.username === safeUpdates.username && u.id !== numericId
        );
        if (exists) throw new Error('Username already exists');
      }

      if (safeUpdates.email) {
        const exists = data.users.some(
          (u) => u.email?.toLowerCase() === safeUpdates.email.toLowerCase() && u.id !== numericId
        );
        if (exists) throw new Error('Email already exists');
      }

      data.users[idx] = {
        ...data.users[idx],
        ...safeUpdates,
        permissions:
          safeUpdates.permissions ||
          (safeUpdates.role
            ? DEFAULT_ROLE_PERMISSIONS[safeUpdates.role]
            : data.users[idx].permissions),
      };

      if (password) {
        data.users[idx].password = await authService.hashPassword(password);
        data.users[idx].forcePasswordChange = false;
      }

      updated = stripPassword(this.normalizeAdmin(data.users[idx]));
      return data;
    });

    await auditService.log(req, 'Admin Edited', {
      targetId: numericId,
      changes: Object.keys(updates),
    });

    return updated;
  },

  async deleteAdmin(req, id) {
    const numericId = Number(id);

    if (req.user?.userId === numericId) {
      throw new Error('You cannot delete your own account');
    }

    let deleted = null;

    await db.update(async (data) => {
      const user = (data.users || []).find((u) => u.id === numericId);
      if (!user) throw new Error('Admin not found');
      deleted = stripPassword(this.normalizeAdmin(user));
      data.users = data.users.filter((u) => u.id !== numericId);
      return data;
    });

    await auditService.log(req, 'Admin Deleted', {
      targetId: numericId,
      targetUsername: deleted?.username,
    });

    return deleted;
  },

  async suspendAdmin(req, id) {
    return this.updateAdmin(req, id, { status: 'suspended' }).then(async (admin) => {
      await auditService.log(req, 'Admin Suspended', { targetId: Number(id) });
      return admin;
    });
  },

  async activateAdmin(req, id) {
    return this.updateAdmin(req, id, { status: 'active', failedLoginAttempts: 0 }).then(
      async (admin) => {
        await auditService.log(req, 'Admin Activated', { targetId: Number(id) });
        return admin;
      }
    );
  },

  async resetAdminPassword(req, id) {
    const numericId = Number(id);
    const tempPassword = generateTempPassword();
    const user = await this.findRawById(numericId);
    if (!user) throw new Error('Admin not found');

    await db.update(async (data) => {
      const idx = data.users.findIndex((u) => u.id === numericId);
      data.users[idx].password = await authService.hashPassword(tempPassword);
      data.users[idx].forcePasswordChange = true;
      return data;
    });

    const smtp = await settingsService.getEffectiveSmtpConfig();
    if (smtp.enabled && user.email) {
      await mailService.sendAdminInvitation({
        to: user.email,
        fullName: user.fullName,
        username: user.username,
        tempPassword,
        loginUrl: `${env.appUrl}/#/admin/login`,
      });
    }

    await auditService.log(req, 'Password Reset', { targetId: numericId, adminName: user.fullName });

    return { message: 'Password reset. Temporary password sent via email if SMTP is enabled.' };
  },

  async recordLogin(user, req, success, rememberMe = false) {
    await db.update(async (data) => {
      const idx = (data.users || []).findIndex((u) => u.id === user.id);
      if (idx === -1) return data;

      const entry = {
        timestamp: new Date().toISOString(),
        ip: req.ip || '',
        browser: req.headers['user-agent'] || '',
        success,
      };

      if (!data.users[idx].loginHistory) data.users[idx].loginHistory = [];
      data.users[idx].loginHistory.unshift(entry);
      data.users[idx].loginHistory = data.users[idx].loginHistory.slice(0, 20);

      if (success) {
        data.users[idx].failedLoginAttempts = 0;
        data.users[idx].lastLogin = entry.timestamp;
      } else {
        data.users[idx].failedLoginAttempts = (data.users[idx].failedLoginAttempts || 0) + 1;
      }

      return data;
    });

    if (success) {
      await auditService.log(req, 'Login', { adminName: user.fullName, rememberMe });
    }
  },

  async recordLogout(req) {
    await auditService.log(req, 'Logout', { adminName: req.user?.username });
  },
};

export default adminService;
