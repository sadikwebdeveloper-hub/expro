import authService from '../services/authService.js';
import adminService from '../services/adminService.js';
import { hasPermission, ROLES } from '../config/permissions.js';
import { sendError } from '../utils/response.js';

export const authenticate = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return sendError(res, 'Authentication required', 401);
    }

    req.user = authService.verifyToken(token);
    next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

export const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }

  const user = await authService.findUserById(req.user.userId);
  if (!user || user.status === 'suspended') {
    return sendError(res, 'Account suspended or not found', 403);
  }

  if (!ROLES.includes(user.role) || user.role === 'viewer') {
    return sendError(res, 'Admin access required', 403);
  }

  req.adminUser = user;
  next();
};

export const requireSuperAdmin = async (req, res, next) => {
  const user = await authService.findUserById(req.user?.userId);
  if (!user || user.role !== 'super_admin') {
    return sendError(res, 'Super admin access required', 403);
  }
  req.adminUser = user;
  next();
};

export const requirePermission = (permission) => async (req, res, next) => {
  try {
    const user = await authService.findUserById(req.user?.userId);
    if (!user || user.status === 'suspended') {
      return sendError(res, 'Access denied', 403);
    }

    if (!hasPermission(user, permission)) {
      return sendError(res, 'Permission denied', 403);
    }

    req.adminUser = user;
    next();
  } catch {
    return sendError(res, 'Authorization failed', 403);
  }
};

export const optionalAuth = (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      req.user = authService.verifyToken(token);
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
};
