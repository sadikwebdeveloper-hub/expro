import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure storage exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// RICH DEFAULT DATA (Restores the "Older" look with full content)
const DEFAULT_DATA = {
  "config": {
    "logoUrl": "https://nexalite-org.github.io/storage/logo.png",
    "phone": "+880 1712 345678",
    "email": "info@exprogroup.com",
    "address": "Expro Tower, Gulshan-2, Dhaka-1212, Bangladesh",
    "facebookUrl": "#",
    "linkedinUrl": "#",
    "youtubeUrl": "#",
    "footerText": "We are a conglomerate committed to sustainable development, transparency, and quality.",
    "mapUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.5983460988937!2d90.4190289759715!3d23.797313086973347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7a0f443577d%3A0x6e65e656d0d21658!2sGulshan%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1714567890123!5m2!1sen!2sbd",
    "notificationEmails": ["admin@exprogroup.com"]
  },
  "slides": [
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
  "about": {
    "introTitle": "Strategic Excellence",
    "introText": "Since its inception, Expro Group has consistently achieved strong progress in the industrial and commercial sectors. Through the policy of recruiting skilled manpower, creating employment, and valuing employees as members of the Expro family, the organization has fostered a permanent and humane work environment.\n\nOur strategy focuses on sustainable development, transparency, and maintaining the highest standards of quality in all our subsidiaries.",
    "chairmanName": "Md. Motaher Hossain",
    "chairmanMessage": "Since its inception, Expro Group has been moving forward with a deep sense of responsibility toward people, society, and the nation. We believe in creating value that lasts for generations.",
    "chairmanImage": "https://nexalite-org.github.io/storage/founder.png",
    "mdName": "Md. Hashan Sofiul Karir",
    "mdMessage": "As the Managing Director of Expro Group, I take immense pride in stating that under the visionary leadership of our Chairman, we have established ourselves as the embodiment of excellence.",
    "mdImage": "",
    "coordinatorName": "Md. Abdul Mottalib",
    "coordinatorMessage": "As a Coordinator of Expro Group, it is an honor for me to work at the center of effective implementation of the profound vision set forth by our Chairman and Managing Director.",
    "coordinatorImage": "",
    "vision": "To be the leading, most trusted, and socially responsible corporate group in Bangladesh.",
    "mission": ["Fostering Development", "Creating Value", "Empowering People", "Ensuring Welfare"]
  },
  "products": [
    { "id": 1, "name": "Premium Organic Fertilizer", "category": "Agro", "image": "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=600&auto=format&fit=crop" },
    { "id": 2, "name": "Industrial Safety Helmet", "category": "Construction", "image": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=600&auto=format&fit=crop" },
    { "id": 3, "name": "Cotton Textile Fabric", "category": "Fashion", "image": "https://images.unsplash.com/photo-1520986606214-8b456906c813?q=80&w=600&auto=format&fit=crop" }
  ],
  "news": [
    { "id": 1, "title": "Grand Opening of New Textile Unit", "content": "Expro Group is proud to announce the expansion of its textile division with a new state-of-the-art facility.", "date": "2025-02-15", "image": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80" },
    { "id": 2, "title": "Award for Best Exporter 2024", "content": "We have been recognized by the Ministry of Commerce for our outstanding contribution to national exports.", "date": "2025-01-20", "image": "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=600&q=80" }
  ],
  "companies": [
    { "id": 1, "name": "Expro Bangladesh PLC", "description": "The flagship entity leading the national industrial sector with innovation.", "icon": "fa-industry", "image": "" },
    { "id": 2, "name": "Expro Welfare Foundation", "description": "Dedicated to social welfare, education, and humanity across the nation.", "icon": "fa-hand-holding-heart", "image": "" },
    { "id": 3, "name": "Expro Global Child Academy", "description": "Shaping the future generation with world-class education systems.", "icon": "fa-graduation-cap", "image": "" }
  ],
  "achievements": [
    { "id": 1, "title": "25+ Years Experience", "image": "" },
    { "id": 2, "title": "50+ Global Awards", "image": "" },
    { "id": 3, "title": "5000+ Employees", "image": "" },
    { "id": 4, "title": "10+ Countries", "image": "" }
  ],
  "partners": [
      { "id": 1, "name": "Partner 1", "logo": "https://placehold.co/150x80?text=Partner+1" },
      { "id": 2, "name": "Partner 2", "logo": "https://placehold.co/150x80?text=Partner+2" },
      { "id": 3, "name": "Partner 3", "logo": "https://placehold.co/150x80?text=Partner+3" }
  ],
  "services": [
      { "id": 1, "title": "Quality Assurance", "description": "We maintain international standards in all production lines.", "icon": "fa-check-circle" },
      { "id": 2, "title": "Global Logistics", "description": "Efficient supply chain management across borders.", "icon": "fa-globe" },
      { "id": 3, "title": "24/7 Support", "description": "Dedicated customer service for our partners.", "icon": "fa-headset" }
  ],
  "directors": [
      { "id": 1, "name": "Md. Motaher Hossain", "position": "Chairman", "image": "https://nexalite-org.github.io/storage/founder.png" },
      { "id": 2, "name": "Md. Hashan Sofiul Karir", "position": "Managing Director", "image": "" },
      { "id": 3, "name": "Md. Abdul Mottalib", "position": "Coordinator", "image": "" }
  ],
  "users": [],
  "media": [],
  "messages": [],
  "visitors": []
};

// Initialize Data File if missing
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
}

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Setup Multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, Date.now() + '-' + safeName);
  }
});
const upload = multer({ storage });

// --- HELPERS ---
const readData = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const d = JSON.parse(raw);
    return { ...DEFAULT_DATA, ...d };
  } catch (err) {
    return DEFAULT_DATA;
  }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing data.json:", err);
    }
};

// --- API ROUTES ---

app.get('/api/check-setup', (req, res) => {
  const data = readData();
  const needsSetup = !data.users || data.users.length === 0;
  res.json({ needsSetup });
});

app.post('/api/setup', (req, res) => {
  const data = readData();
  if (data.users && data.users.length > 0) return res.status(403).json({ message: 'Setup done.' });
  const { username, password, fullName, email } = req.body;
  const newUser = { id: Date.now(), username, password, fullName, email, role: 'super_admin' };
  data.users = [newUser];
  writeData(data);
  res.json({ success: true });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const data = readData();
  const user = data.users.find(u => u.username === username && u.password === password);
  if (user) {
    const { password: _, ...userSafe } = user;
    res.json(userSafe);
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Generic GET endpoints
const endpoints = ['config', 'slides', 'about', 'companies', 'products', 'news', 'media', 'achievements', 'partners', 'services', 'directors', 'messages', 'visitors', 'users'];
endpoints.forEach(ep => {
    app.get(`/api/${ep}`, (req, res) => {
        const data = readData();
        if(ep === 'users') {
            return res.json((data.users || []).map(({password, ...u}) => u));
        }
        res.json(data[ep] || []);
    });
});

// Updates (PUT) for Single Objects
app.put('/api/config', (req, res) => {
    const data = readData();
    data.config = { ...data.config, ...req.body };
    writeData(data);
    res.json(data.config);
});
app.put('/api/slides', (req, res) => {
    const data = readData();
    data.slides = req.body;
    writeData(data);
    res.json(data.slides);
});
app.put('/api/about', (req, res) => {
    const data = readData();
    data.about = { ...data.about, ...req.body };
    writeData(data);
    res.json(data.about);
});
app.put('/api/services', (req, res) => {
    const data = readData();
    data.services = req.body;
    writeData(data);
    res.json(data.services);
});

// --- GENERIC LIST UPDATERS (Partners, Achievements, Directors) ---
const createUpdater = (key) => (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const idx = data[key].findIndex(i => i.id === id);
    if(idx > -1) {
        data[key][idx] = { ...data[key][idx], ...req.body };
        writeData(data);
        res.json(data[key][idx]);
    } else {
        res.status(404).json({error: "Not found"});
    }
};

app.put('/api/partners/:id', createUpdater('partners'));
app.put('/api/achievements/:id', createUpdater('achievements'));
app.put('/api/directors/:id', createUpdater('directors'));


// --- LIST EDITING/ADDING ---

// Companies (with Logo upload)
app.post('/api/companies', upload.single('image'), (req, res) => {
  const data = readData();
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
  const item = { id: Date.now(), ...req.body, image: imageUrl };
  if(!data.companies) data.companies = [];
  data.companies.push(item);
  writeData(data);
  res.json(item);
});

app.put('/api/companies/:id', upload.single('image'), (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const idx = data.companies.findIndex(c => c.id === id);
  if (idx > -1) {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : data.companies[idx].image;
    data.companies[idx] = { ...data.companies[idx], ...req.body, image: imageUrl };
    writeData(data);
    res.json(data.companies[idx]);
  } else res.status(404).json({error: "Not found"});
});

// Products
app.post('/api/products', upload.single('image'), (req, res) => {
    const data = readData();
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const item = { id: Date.now(), ...req.body, image: imageUrl };
    if(!data.products) data.products = [];
    data.products.unshift(item);
    writeData(data);
    res.json(item);
});

app.put('/api/products/:id', upload.single('image'), (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const idx = data.products.findIndex(p => p.id === id);
  if (idx > -1) {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : data.products[idx].image;
    data.products[idx] = { ...data.products[idx], ...req.body, image: imageUrl };
    writeData(data);
    res.json(data.products[idx]);
  } else res.status(404).json({error: "Not found"});
});

// News
app.post('/api/news', upload.single('image'), (req, res) => {
  const data = readData();
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
  const item = { id: Date.now(), ...req.body, image: imageUrl };
  if(!data.news) data.news = [];
  data.news.unshift(item);
  writeData(data);
  res.json(item);
});

app.put('/api/news/:id', upload.single('image'), (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const idx = data.news.findIndex(n => n.id === id);
  if (idx > -1) {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : data.news[idx].image;
    data.news[idx] = { ...data.news[idx], ...req.body, image: imageUrl };
    writeData(data);
    res.json(data.news[idx]);
  } else res.status(404).json({error: "Not found"});
});

// Media
app.post('/api/media', upload.single('image'), (req, res) => {
  const data = readData();
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
  const item = { id: Date.now(), ...req.body, image: imageUrl };
  if(!data.media) data.media = [];
  data.media.unshift(item);
  writeData(data);
  res.json(item);
});

app.put('/api/media/:id', upload.single('image'), (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const idx = data.media.findIndex(m => m.id === id);
  if (idx > -1) {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : data.media[idx].image;
    data.media[idx] = { ...data.media[idx], ...req.body, image: imageUrl };
    writeData(data);
    res.json(data.media[idx]);
  } else res.status(404).json({error: "Not found"});
});

// Simple JSON Post (Partners, Directors, Achievements, Messages)
const simplePost = (key) => (req, res) => {
  const data = readData();
  const item = { id: Date.now(), ...req.body };
  if (!data[key]) data[key] = [];
  data[key].unshift(item);
  writeData(data);
  res.json(item);
};
app.post('/api/achievements', simplePost('achievements'));
app.post('/api/partners', simplePost('partners'));
app.post('/api/directors', simplePost('directors'));
app.post('/api/users', simplePost('users')); 

app.post('/api/messages', (req, res) => {
  const data = readData();
  const item = { id: Date.now(), date: new Date().toISOString().split('T')[0], ...req.body };
  if (!data.messages) data.messages = [];
  data.messages.unshift(item);
  writeData(data);
  res.json({success: true});
});

app.post('/api/visit', (req, res) => {
  const data = readData();
  const item = { id: Date.now(), ip: req.ip, userAgent: req.headers['user-agent'], date: new Date().toLocaleString() };
  if(!data.visitors) data.visitors = [];
  data.visitors.unshift(item);
  writeData(data);
  res.json({success: true});
});

// Deletions
const createDeleter = (key) => (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  if(data[key]) {
      data[key] = data[key].filter(i => i.id !== id);
      writeData(data);
  }
  res.json({ success: true });
};

app.delete('/api/companies/:id', createDeleter('companies'));
app.delete('/api/products/:id', createDeleter('products'));
app.delete('/api/news/:id', createDeleter('news'));
app.delete('/api/media/:id', createDeleter('media'));
app.delete('/api/achievements/:id', createDeleter('achievements'));
app.delete('/api/partners/:id', createDeleter('partners'));
app.delete('/api/directors/:id', createDeleter('directors'));
app.delete('/api/users/:id', createDeleter('users'));

// --- SERVE FRONTEND (For Hosting) ---
// Serve static files from the 'dist' directory (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing by returning index.html for unknown non-API routes
app.use((req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).send('Not Found');
  }

  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));