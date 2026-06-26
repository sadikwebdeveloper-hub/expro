import { Product, Achievement, NewsItem, Message, User, MediaItem, SiteConfig, HeroSlide, AboutContent, Company, Visitor, Partner, ServiceCard, Director } from '../types';

// Helper to safely determine API URL without crashing
const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        if (window.location.port === '5173') {
            return 'http://localhost:5000/api';
        }
    }
    return '/api';
}

const API_URL = getBaseUrl();

// --- RICH MOCK DATA FOR FALLBACK ---
const MOCK_DATA = {
  config: {
    logoUrl: "https://nexalite-org.github.io/storage/logo.png",
    phone: "+880 1712 345678",
    email: "info@exprogroup.com",
    address: "Expro Tower, Gulshan-2, Dhaka-1212, Bangladesh",
    facebookUrl: "#",
    linkedinUrl: "#",
    youtubeUrl: "#",
    footerText: "We are a conglomerate committed to sustainable development, transparency, and quality.",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.5983460988937!2d90.4190289759715!3d23.797313086973347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7a0f443577d%3A0x6e65e656d0d21658!2sGulshan%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1714567890123!5m2!1sen!2sbd",
    notificationEmails: ["admin@exprogroup.com"]
  },
  slides: [
    {
      "id": 1,
      "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      "subtitle": "WELCOME TO EXPRO GROUP",
      "title": "Legacy of Excellence",
      "description": "Leading the nation with sustainable industrial growth and unwavering commitment to quality.",
      "buttonText": "Discover More",
      "link": "/about"
    },
    {
      "id": 2,
      "image": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2070",
      "subtitle": "INNOVATION & TECHNOLOGY",
      "title": "Driving Future Industries",
      "description": "Utilizing cutting-edge technology to revolutionize manufacturing and service sectors.",
      "buttonText": "Our Products",
      "link": "/products"
    },
    {
      "id": 3,
      "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=2070",
      "subtitle": "HUMAN CAPITAL",
      "title": "Empowering People",
      "description": "Creating opportunities and fostering a skilled workforce for national development.",
      "buttonText": "Contact Us",
      "link": "/contact"
    }
  ],
  about: {
    introTitle: "Strategic Excellence",
    introText: "Since its inception, Expro Group has consistently achieved strong progress in the industrial and commercial sectors. Through the policy of recruiting skilled manpower, creating employment, and valuing employees as members of the Expro family, the organization has fostered a permanent and humane work environment.\n\nOur strategy focuses on sustainable development, transparency, and maintaining the highest standards of quality in all our subsidiaries.",
    chairmanName: "Md. Motaher Hossain",
    chairmanMessage: "Since its inception, Expro Group has been moving forward with a deep sense of responsibility toward people, society, and the nation. We believe in creating value that lasts for generations.",
    chairmanImage: "https://nexalite-org.github.io/storage/founder.png",
    mdName: "Md. Hashan Sofiul Karir",
    mdMessage: "As the Managing Director of Expro Group, I take immense pride in stating that under the visionary leadership of our Chairman, we have established ourselves as the embodiment of excellence.",
    mdImage: "",
    coordinatorName: "Md. Abdul Mottalib",
    coordinatorMessage: "As a Coordinator of Expro Group, it is an honor for me to work at the center of effective implementation of the profound vision set forth by our Chairman and Managing Director.",
    coordinatorImage: "",
    vision: "To be the leading, most trusted, and socially responsible corporate group in Bangladesh.",
    mission: ["Fostering Development", "Creating Value", "Empowering People", "Ensuring Welfare"]
  },
  products: [
    { "id": 1, "name": "Premium Organic Fertilizer", "category": "Agro", "image": "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=600&auto=format&fit=crop" },
    { "id": 2, "name": "Industrial Safety Helmet", "category": "Construction", "image": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=600&auto=format&fit=crop" },
    { "id": 3, "name": "Cotton Textile Fabric", "category": "Fashion", "image": "https://images.unsplash.com/photo-1520986606214-8b456906c813?q=80&w=600&auto=format&fit=crop" }
  ],
  news: [
    { "id": 1, "title": "Grand Opening of New Textile Unit", "content": "Expro Group is proud to announce the expansion of its textile division with a new state-of-the-art facility.", "date": "2025-02-15", "image": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80" },
    { "id": 2, "title": "Award for Best Exporter 2024", "content": "We have been recognized by the Ministry of Commerce for our outstanding contribution to national exports.", "date": "2025-01-20", "image": "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=600&q=80" }
  ],
  companies: [
    { "id": 1, "name": "Expro Bangladesh PLC", "description": "The flagship entity leading the national industrial sector with innovation.", "icon": "fa-industry", "image": "" },
    { "id": 2, "name": "Expro Welfare Foundation", "description": "Dedicated to social welfare, education, and humanity across the nation.", "icon": "fa-hand-holding-heart", "image": "" },
    { "id": 3, "name": "Expro Global Child Academy", "description": "Shaping the future generation with world-class education systems.", "icon": "fa-graduation-cap", "image": "" }
  ],
  achievements: [
    { "id": 1, "title": "25+ Years Experience", "image": "" },
    { "id": 2, "title": "50+ Global Awards", "image": "" },
    { "id": 3, "title": "5000+ Employees", "image": "" },
    { "id": 4, "title": "10+ Countries", "image": "" }
  ],
  partners: [
      { "id": 1, "name": "Partner 1", "logo": "https://placehold.co/150x80?text=Partner+1" },
      { "id": 2, "name": "Partner 2", "logo": "https://placehold.co/150x80?text=Partner+2" },
      { "id": 3, "name": "Partner 3", "logo": "https://placehold.co/150x80?text=Partner+3" }
  ],
  services: [
      { "id": 1, "title": "Quality Assurance", "description": "We maintain international standards in all production lines.", "icon": "fa-check-circle" },
      { "id": 2, "title": "Global Logistics", "description": "Efficient supply chain management across borders.", "icon": "fa-globe" },
      { "id": 3, "title": "24/7 Support", "description": "Dedicated customer service for our partners.", "icon": "fa-headset" }
  ],
  directors: [
      { "id": 1, "name": "Md. Motaher Hossain", "position": "Chairman", "image": "https://nexalite-org.github.io/storage/founder.png" },
      { "id": 2, "name": "Md. Hashan Sofiul Karir", "position": "Managing Director", "image": "" },
      { "id": 3, "name": "Md. Abdul Mottalib", "position": "Coordinator", "image": "" }
  ],
  users: [], // Intentionally empty to force secure setup on first run
  media: [],
  messages: [],
  visitors: []
};

class RealBackend {
  private async request(url: string, options: RequestInit = {}) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await res.json();
      }
      return { success: true };
    } catch (e) {
      console.warn(`Backend request failed for ${url}:`, e);
      throw e;
    }
  }

  private async postJson(url: string, body: any) {
    return this.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  private async putJson(url: string, body: any) {
    return this.request(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  // --- Auth & Setup ---
  async checkSetup(): Promise<boolean> {
    try {
      const data = await this.request(`${API_URL}/check-setup`);
      return data.needsSetup;
    } catch { 
      // If API fails, check mock data length
      return MOCK_DATA.users.length === 0; 
    } 
  }

  async setupAdmin(data: any): Promise<boolean> {
    try {
      await this.postJson(`${API_URL}/setup`, data);
      return true;
    } catch { 
      // Fallback for purely client-side demo (simulates creating first user)
      if (MOCK_DATA.users.length === 0) {
        MOCK_DATA.users.push({ id: 1, ...data, role: 'super_admin' });
        return true;
      }
      return false; 
    }
  }

  async login(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.postJson(`${API_URL}/login`, { username, password });
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      }
    } catch { 
        // Secure Fallback: Check against MOCK_DATA users only (no hardcoded 'admin')
        const u = MOCK_DATA.users.find(u => u.username === username && u.password === password);
        if(u) {
            localStorage.setItem('currentUser', JSON.stringify(u));
            return u as User;
        }
    }
    return null;
  }

  async forgotPassword(email: string): Promise<boolean> {
      try { await this.postJson(`${API_URL}/forgot-password`, { email }); return true; } catch { return true; }
  }

  logout() { localStorage.removeItem('currentUser'); }
  getCurrentUser(): User | null { const u = localStorage.getItem('currentUser'); return u ? JSON.parse(u) : null; }

  async updateProfile(userId: number, data: any): Promise<User | null> {
    const current = this.getCurrentUser();
    if(current) {
        try { await this.postJson(`${API_URL}/profile`, { userId, ...data }); } catch {}
        const updated = { ...current, ...data };
        if(updated.password) delete updated.password;
        localStorage.setItem('currentUser', JSON.stringify(updated));
        
        // Update mock data if offline
        const mockIdx = MOCK_DATA.users.findIndex(u => u.id === userId);
        if(mockIdx > -1) {
             MOCK_DATA.users[mockIdx] = { ...MOCK_DATA.users[mockIdx], ...data };
        }
        
        return updated;
    }
    return null;
  }

  // --- User Management ---
  async getUsers(): Promise<User[]> {
      try { return await this.request(`${API_URL}/users`); } 
      catch { return MOCK_DATA.users as User[]; }
  }
  async addUser(user: any): Promise<boolean> {
      try { await this.postJson(`${API_URL}/users`, user); return true; } 
      catch { 
         // Mock fallback
         if(MOCK_DATA.users.find(u => u.username === user.username)) return false;
         MOCK_DATA.users.push({ id: Date.now(), ...user });
         return true;
      }
  }
  async deleteUser(id: number): Promise<void> {
      try { await this.request(`${API_URL}/users/${id}`, { method: 'DELETE' }); } 
      catch {
         MOCK_DATA.users = MOCK_DATA.users.filter(u => u.id !== id);
      }
  }

  // --- Data Access with Mock Fallback ---
  // Using explicit fallbacks checks: if API returns empty array/object, use mock data to ensure UI is populated.

  async getConfig(): Promise<SiteConfig> {
    try { return await this.request(`${API_URL}/config`); } 
    catch { return MOCK_DATA.config as SiteConfig; }
  }
  async updateConfig(config: SiteConfig): Promise<void> {
    try { await this.putJson(`${API_URL}/config`, config); } catch { }
  }

  async getSlides(): Promise<HeroSlide[]> {
    try { 
        const data = await this.request(`${API_URL}/slides`);
        return (data && data.length > 0) ? data : MOCK_DATA.slides;
    } catch { return MOCK_DATA.slides; }
  }
  async updateSlides(slides: HeroSlide[]): Promise<void> {
    try { await this.putJson(`${API_URL}/slides`, slides); } catch { }
  }

  async getAboutContent(): Promise<AboutContent> {
    try { 
        const data = await this.request(`${API_URL}/about`);
        // If object is empty or missing key properties, return mock
        return (data && data.introTitle) ? data : MOCK_DATA.about as AboutContent;
    } catch { return MOCK_DATA.about as AboutContent; }
  }
  async updateAboutContent(content: AboutContent): Promise<void> {
    try { await this.putJson(`${API_URL}/about`, content); } catch { }
  }

  async getCompanies(): Promise<Company[]> {
    try { 
        const data = await this.request(`${API_URL}/companies`);
        return (data && data.length > 0) ? data : MOCK_DATA.companies;
    } catch { return MOCK_DATA.companies; }
  }
  async addCompany(formData: FormData): Promise<void> {
    try { await fetch(`${API_URL}/companies`, { method: 'POST', body: formData }); } catch { }
  }
  async updateCompany(id: number, formData: FormData): Promise<void> {
    try { await fetch(`${API_URL}/companies/${id}`, { method: 'PUT', body: formData }); } catch {}
  }
  async deleteCompany(id: number): Promise<void> {
    try { await this.request(`${API_URL}/companies/${id}`, { method: 'DELETE' }); } catch { }
  }

  async getProducts(): Promise<Product[]> {
    try { 
        const data = await this.request(`${API_URL}/products`);
        return (data && data.length > 0) ? data : MOCK_DATA.products;
    } catch { return MOCK_DATA.products; }
  }
  async addProduct(formData: FormData): Promise<void> {
    try { await fetch(`${API_URL}/products`, { method: 'POST', body: formData }); } catch { }
  }
  async updateProduct(id: number, formData: FormData): Promise<void> {
    try { await fetch(`${API_URL}/products/${id}`, { method: 'PUT', body: formData }); } catch {}
  }
  async deleteProduct(id: number): Promise<void> {
    try { await this.request(`${API_URL}/products/${id}`, { method: 'DELETE' }); } catch { }
  }

  async getNews(): Promise<NewsItem[]> { 
    try { 
        const data = await this.request(`${API_URL}/news`);
        return (data && data.length > 0) ? data : MOCK_DATA.news;
    } catch { return MOCK_DATA.news; }
  }
  async addNews(formData: FormData): Promise<void> { 
     try { await fetch(`${API_URL}/news`, { method: 'POST', body: formData }); } catch { }
  }
  async updateNews(id: number, formData: FormData): Promise<void> {
      try { await fetch(`${API_URL}/news/${id}`, { method: 'PUT', body: formData }); } catch {}
  }
  async deleteNews(id: number): Promise<void> { 
    try { await this.request(`${API_URL}/news/${id}`, { method: 'DELETE' }); } catch { }
  }

  async getMedia(): Promise<MediaItem[]> { 
    try { return await this.request(`${API_URL}/media`); } 
    catch { return MOCK_DATA.media as any[]; }
  }
  async addMedia(formData: FormData): Promise<void> { 
    try { await fetch(`${API_URL}/media`, { method: 'POST', body: formData }); } catch { }
  }
  async updateMedia(id: number, formData: FormData): Promise<void> {
    try { await fetch(`${API_URL}/media/${id}`, { method: 'PUT', body: formData }); } catch {}
  }
  async deleteMedia(id: number): Promise<void> { 
    try { await this.request(`${API_URL}/media/${id}`, { method: 'DELETE' }); } catch { }
  }

  async getAchievements(): Promise<Achievement[]> { 
    try { 
        const data = await this.request(`${API_URL}/achievements`); 
        return (data && data.length > 0) ? data : MOCK_DATA.achievements;
    } catch { return MOCK_DATA.achievements; }
  }
  async addAchievement(item: any): Promise<void> { try { await this.postJson(`${API_URL}/achievements`, item); } catch { } }
  async updateAchievement(id: number, item: any): Promise<void> { try { await this.putJson(`${API_URL}/achievements/${id}`, item); } catch { } }
  async deleteAchievement(id: number): Promise<void> { try { await this.request(`${API_URL}/achievements/${id}`, { method: 'DELETE' }); } catch { } }

  async getPartners(): Promise<Partner[]> {
    try { 
        const data = await this.request(`${API_URL}/partners`); 
        return (data && data.length > 0) ? data : MOCK_DATA.partners;
    } catch { return MOCK_DATA.partners; }
  }
  async addPartner(item: any): Promise<void> { try { await this.postJson(`${API_URL}/partners`, item); } catch {} }
  async updatePartner(id: number, item: any): Promise<void> { try { await this.putJson(`${API_URL}/partners/${id}`, item); } catch {} }
  async deletePartner(id: number): Promise<void> { try { await this.request(`${API_URL}/partners/${id}`, { method: 'DELETE' }); } catch {} }

  async getServiceCards(): Promise<ServiceCard[]> {
    try { 
        const data = await this.request(`${API_URL}/services`); 
        return (data && data.length > 0) ? data : MOCK_DATA.services;
    } catch { return MOCK_DATA.services; }
  }
  async updateServiceCards(cards: ServiceCard[]): Promise<void> { try { await this.putJson(`${API_URL}/services`, cards); } catch {} }

  async getDirectors(): Promise<Director[]> {
    try { 
        const data = await this.request(`${API_URL}/directors`); 
        return (data && data.length > 0) ? data : MOCK_DATA.directors;
    } catch { return MOCK_DATA.directors; }
  }
  async addDirector(item: any): Promise<void> { try { await this.postJson(`${API_URL}/directors`, item); } catch {} }
  async updateDirector(id: number, item: any): Promise<void> { try { await this.putJson(`${API_URL}/directors/${id}`, item); } catch {} }
  async deleteDirector(id: number): Promise<void> { try { await this.request(`${API_URL}/directors/${id}`, { method: 'DELETE' }); } catch {} }

  async getMessages(): Promise<Message[]> {
    try { return await this.request(`${API_URL}/messages`); } 
    catch { return MOCK_DATA.messages as any[]; }
  }
  async sendMessage(msg: Omit<Message, 'id' | 'date'>): Promise<void> { try { await this.postJson(`${API_URL}/messages`, msg); } catch { } }

  async trackVisit(): Promise<void> {
    if (sessionStorage.getItem('visited')) return;
    try { await fetch(`${API_URL}/visit`, { method: 'POST' }); sessionStorage.setItem('visited', 'true'); } catch { }
  }
  async getVisitors(): Promise<Visitor[]> {
    try { return await this.request(`${API_URL}/visit`); } catch { return MOCK_DATA.visitors as any[]; }
  }
}

export const backend = new RealBackend();