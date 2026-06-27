export const PERMISSIONS = [
  'dashboard',
  'products',
  'users',
  'messages',
  'orders',
  'reports',
  'settings',
  'visitorTracking',
  'pages',
  'subsidiaries',
  'admins',
  'auditLogs',
];

export const ROLES = ['super_admin', 'admin', 'manager', 'moderator', 'editor', 'viewer'];

export const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: Object.fromEntries(PERMISSIONS.map((p) => [p, true])),
  admin: {
    dashboard: true,
    products: true,
    users: true,
    messages: true,
    orders: true,
    reports: true,
    settings: true,
    visitorTracking: true,
    pages: true,
    subsidiaries: true,
    admins: true,
    auditLogs: true,
  },
  manager: {
    dashboard: true,
    products: true,
    users: false,
    messages: true,
    orders: true,
    reports: true,
    settings: false,
    visitorTracking: true,
    pages: true,
    subsidiaries: true,
    admins: false,
    auditLogs: false,
  },
  editor: {
    dashboard: true,
    products: true,
    users: false,
    messages: true,
    orders: false,
    reports: false,
    settings: false,
    visitorTracking: false,
    pages: true,
    subsidiaries: true,
    admins: false,
    auditLogs: false,
  },
  moderator: {
    dashboard: true,
    products: false,
    users: false,
    messages: true,
    orders: false,
    reports: false,
    settings: false,
    visitorTracking: true,
    pages: false,
    subsidiaries: false,
    admins: false,
    auditLogs: false,
  },
  viewer: {
    dashboard: true,
    products: true,
    users: false,
    messages: true,
    orders: true,
    reports: true,
    settings: false,
    visitorTracking: true,
    pages: true,
    subsidiaries: true,
    admins: false,
    auditLogs: false,
  },
};

export const ADMIN_ROLES = ['super_admin', 'admin'];

export const hasPermission = (user, permission) => {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (user.status === 'suspended') return false;
  return Boolean(user.permissions?.[permission]);
};

export const isAdminRole = (role) => ROLES.includes(role) && role !== 'viewer';
