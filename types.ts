
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

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: 'super_admin' | 'manager';
  profilePic?: string;
  password?: string; // Only used for transport/storage, not exposed in UI
  email?: string; // For recovery
}

export interface MediaItem {
  id: number;
  title: string;
  type: 'Gallery' | 'Slider';
  image: string;
}

// New Types for Dynamic Content
export interface SiteConfig {
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  facebookUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  footerText: string;
  mapUrl: string;
  // New: Email Notification Settings
  notificationEmails: string[]; 
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
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
  image?: string; // Added for logo support
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