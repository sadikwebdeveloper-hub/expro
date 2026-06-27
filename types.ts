
export interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
}

export interface Achievement {
  id: number;
  title: string;
  image: string;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  image: string;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
}

export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'moderator' | 'editor' | 'viewer';
export type AdminStatus = 'active' | 'suspended';

export interface AdminPermissions {
  dashboard?: boolean;
  products?: boolean;
  users?: boolean;
  messages?: boolean;
  orders?: boolean;
  reports?: boolean;
  settings?: boolean;
  visitorTracking?: boolean;
  pages?: boolean;
  subsidiaries?: boolean;
  admins?: boolean;
  auditLogs?: boolean;
}

export interface LoginHistoryEntry {
  timestamp: string;
  ip: string;
  browser: string;
  success: boolean;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: AdminRole;
  status?: AdminStatus;
  permissions?: AdminPermissions;
  profilePic?: string;
  password?: string;
  email?: string;
  forcePasswordChange?: boolean;
  failedLoginAttempts?: number;
  loginHistory?: LoginHistoryEntry[];
  lastLogin?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface AuditLogEntry {
  id: number;
  adminId: number | null;
  adminUsername: string;
  adminName: string;
  action: string;
  details: Record<string, unknown>;
  ip: string;
  browser: string;
  timestamp: string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  passwordEncrypted?: string;
  hasPassword?: boolean;
  encryption: 'None' | 'TLS' | 'SSL';
  fromEmail: string;
  fromName: string;
  replyTo: string;
  enabled: boolean;
  enableContactForm: boolean;
  enableOtp: boolean;
  enableForgotPassword: boolean;
  enableWelcome: boolean;
}

export interface AppSettings {
  general: {
    websiteName: string;
    timezone: string;
    currency: string;
    language: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
  contact: {
    phone: string;
    email: string;
    supportEmail: string;
    address: string;
    mapUrl: string;
    notificationEmails: string[];
  };
  branding: {
    logoUrl: string;
    faviconUrl: string;
  };
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
    youtube: string;
    whatsapp: string;
    telegram: string;
    messenger: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    googleAnalyticsId: string;
    facebookPixelId: string;
  };
  footer: {
    copyright: string;
  };
  smtp: SmtpSettings;
  cloudinary?: { enabled: boolean; cloudName: string };
  otp?: { length: number; expiryMinutes: number; maxAttempts: number; cooldownSeconds: number };
  security?: { maxLoginAttempts: number; sessionHours: number; rememberMeDays: number };
  systemStatus?: {
    smtp: { verified: boolean; message: string };
    cloudinary: { verified: boolean; message: string };
  };
}

export interface MediaItem {
  id: number;
  title: string;
  type: 'Gallery' | 'Slider';
  image: string;
}

export interface SiteConfig {
  logoUrl: string;
  faviconUrl?: string;
  phone: string;
  email: string;
  supportEmail?: string;
  address: string;
  facebookUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  instagramUrl?: string;
  twitterUrl?: string;
  whatsappUrl?: string;
  telegramUrl?: string;
  messengerUrl?: string;
  footerText: string;
  mapUrl: string;
  notificationEmails: string[];
  websiteName?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
}

export interface HeroSlide {
  id: number;
  image: string;
  subtitle: string;
  title: string;
  description: string;
  buttonText: string;
  link: string;
}

export interface AboutContent {
  introTitle: string;
  introText: string;
  chairmanName: string;
  chairmanMessage: string;
  chairmanImage: string;
  mdName: string;
  mdMessage: string;
  mdImage: string;
  coordinatorName: string;
  coordinatorMessage: string;
  coordinatorImage: string;
  vision: string;
  mission: string[];
}

export interface Director {
  id: number;
  name: string;
  position: string;
  image: string;
}

export interface Company {
  id: number;
  name: string;
  description: string;
  icon: string;
  image?: string;
}

export interface Visitor {
  id: number;
  ip: string;
  userAgent: string;
  date: string;
}

export interface Partner {
  id: number;
  name: string;
  logo: string;
}

export interface ServiceCard {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export const PERMISSION_LABELS: Record<keyof AdminPermissions, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  users: 'Users',
  messages: 'Messages',
  orders: 'Orders',
  reports: 'Reports',
  settings: 'Settings',
  visitorTracking: 'Visitor Tracking',
  pages: 'Pages',
  subsidiaries: 'Subsidiaries',
  admins: 'Admins',
  auditLogs: 'Audit Logs',
};

export const ADMIN_ROLES: AdminRole[] = ['super_admin', 'admin', 'manager', 'moderator', 'editor', 'viewer'];
