import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import db from '../database/index.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../config/permissions.js';
import { stripPassword } from '../utils/response.js';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_DEFAULT = '24h';
const TOKEN_EXPIRY_REMEMBER = '30d';
const MAX_FAILED_ATTEMPTS = 5;

const isBcryptHash = (value) =>
  typeof value === 'string' && value.startsWith('$2');

export const authService = {
  async hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async verifyPassword(plainPassword, storedPassword) {
    if (!storedPassword) return false;
    if (isBcryptHash(storedPassword)) {
      return bcrypt.compare(plainPassword, storedPassword);
    }
    return plainPassword === storedPassword;
  },

  signToken(user, rememberMe = false) {
    return jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        forcePasswordChange: Boolean(user.forcePasswordChange),
      },
      env.jwtSecret,
      { expiresIn: rememberMe ? TOKEN_EXPIRY_REMEMBER : TOKEN_EXPIRY_DEFAULT }
    );
  },

  verifyToken(token) {
    return jwt.verify(token, env.jwtSecret);
  },

  async findUserByUsername(username) {
    const data = await db.getAll();
    return (data.users || []).find((u) => u.username === username) || null;
  },

  async findUserByEmail(email) {
    const data = await db.getAll();
    return (data.users || []).find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    const data = await db.getAll();
    const user = (data.users || []).find((u) => u.id === Number(id));
    if (!user) return null;
    return {
      ...stripPassword(user),
      permissions: user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || {},
      status: user.status || 'active',
      forcePasswordChange: Boolean(user.forcePasswordChange),
      loginHistory: user.loginHistory || [],
      failedLoginAttempts: user.failedLoginAttempts || 0,
    };
  },

  async login(username, password, rememberMe = false) {
    const user = await this.findUserByUsername(username);
    if (!user) return { error: 'Invalid credentials' };

    if (user.status === 'suspended') {
      return { error: 'Account suspended. Contact super admin.' };
    }

    if ((user.failedLoginAttempts || 0) >= MAX_FAILED_ATTEMPTS) {
      return { error: 'Account locked due to too many failed attempts. Contact super admin.' };
    }

    const valid = await this.verifyPassword(password, user.password);
    if (!valid) {
      await db.update(async (data) => {
        const idx = data.users.findIndex((u) => u.id === user.id);
        if (idx > -1) {
          data.users[idx].failedLoginAttempts = (data.users[idx].failedLoginAttempts || 0) + 1;
        }
        return data;
      });
      return { error: 'Invalid credentials' };
    }

    if (!isBcryptHash(user.password)) {
      await db.update(async (data) => {
        const idx = data.users.findIndex((u) => u.id === user.id);
        if (idx > -1) {
          data.users[idx].password = await this.hashPassword(password);
        }
        return data;
      });
    }

    const safeUser = stripPassword({
      ...user,
      permissions: user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || {},
    });

    const token = this.signToken(user, rememberMe);
    return {
      user: safeUser,
      token,
      forcePasswordChange: Boolean(user.forcePasswordChange),
      expiresIn: rememberMe ? TOKEN_EXPIRY_REMEMBER : TOKEN_EXPIRY_DEFAULT,
    };
  },

  async setupAdmin({ username, password, fullName, email }) {
    const data = await db.getAll();
    if (data.users?.length > 0) {
      throw new Error('Setup already completed');
    }

    const hashedPassword = await this.hashPassword(password);
    const newUser = {
      id: Date.now(),
      username,
      password: hashedPassword,
      fullName,
      email,
      role: 'super_admin',
      status: 'active',
      permissions: DEFAULT_ROLE_PERMISSIONS.super_admin,
      forcePasswordChange: false,
      failedLoginAttempts: 0,
      loginHistory: [],
    };

    data.users = [newUser];
    await db.save(data);

    return stripPassword(newUser);
  },

  async updateProfile(userId, updates) {
    let updatedUser = null;

    await db.update(async (data) => {
      const idx = (data.users || []).findIndex((u) => u.id === userId);
      if (idx === -1) throw new Error('User not found');

      const { password, ...safeUpdates } = updates;
      data.users[idx] = { ...data.users[idx], ...safeUpdates };

      if (password) {
        data.users[idx].password = await this.hashPassword(password);
        data.users[idx].forcePasswordChange = false;
      }

      updatedUser = stripPassword(data.users[idx]);
      return data;
    });

    return updatedUser;
  },

  async resetPassword(email, newPassword) {
    let updated = false;

    await db.update(async (data) => {
      const idx = (data.users || []).findIndex(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );
      if (idx === -1) return data;

      data.users[idx].password = await this.hashPassword(newPassword);
      data.users[idx].forcePasswordChange = false;
      updated = true;
      return data;
    });

    return updated;
  },

  async addUser(userData) {
    const data = await db.getAll();
    if ((data.users || []).some((u) => u.username === userData.username)) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await this.hashPassword(userData.password);
    const item = {
      id: Date.now(),
      ...userData,
      password: hashedPassword,
      status: userData.status || 'active',
      permissions: userData.permissions || DEFAULT_ROLE_PERMISSIONS[userData.role] || {},
      forcePasswordChange: Boolean(userData.forcePasswordChange),
      failedLoginAttempts: 0,
      loginHistory: [],
    };

    await db.update(async (d) => {
      if (!d.users) d.users = [];
      d.users.unshift(item);
      return d;
    });

    return stripPassword(item);
  },
};

export default authService;
