import adminService from '../services/adminService.js';
import auditService from '../services/auditService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitizeObject } from '../utils/sanitize.js';

export const adminController = {
  async list(req, res) {
    const { search = '', role = '', status = '', page = 1, limit = 20, sort = 'createdAt' } = req.query;
    const result = await adminService.getAllAdmins({
      search: String(search),
      role: String(role),
      status: String(status),
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      sort: String(sort),
    });
    return sendSuccess(res, 'Admins retrieved', result);
  },

  async create(req, res) {
    try {
      const admin = await adminService.createAdmin(req, sanitizeObject(req.body));
      return sendSuccess(res, 'Admin created successfully', admin, 201);
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  async update(req, res) {
    try {
      const admin = await adminService.updateAdmin(req, req.params.id, sanitizeObject(req.body));
      return sendSuccess(res, 'Admin updated successfully', admin);
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  async remove(req, res) {
    try {
      await adminService.deleteAdmin(req, req.params.id);
      return sendSuccess(res, 'Admin deleted successfully', null);
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  async resetPassword(req, res) {
    try {
      const result = await adminService.resetAdminPassword(req, req.params.id);
      return sendSuccess(res, result.message, null);
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  async suspend(req, res) {
    try {
      const admin = await adminService.suspendAdmin(req, req.params.id);
      return sendSuccess(res, 'Admin suspended', admin);
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  async activate(req, res) {
    try {
      const admin = await adminService.activateAdmin(req, req.params.id);
      return sendSuccess(res, 'Admin activated', admin);
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  async auditLogs(req, res) {
    const logs = await auditService.getLogs(Number(req.query.limit) || 100);
    return sendSuccess(res, 'Audit logs retrieved', logs);
  },
};

export default adminController;
