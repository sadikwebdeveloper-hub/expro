import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_DATA } from '../config/defaultData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database abstraction layer.
 * Swap JsonDatabase for MongoDatabase later without changing controllers.
 */
export class JsonDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.ensureFile();
  }

  ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(DEFAULT_DATA, null, 2));
    }
  }

  read() {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_DATA, ...parsed, otps: parsed.otps || [], auditLogs: parsed.auditLogs || [] };
    } catch {
      return { ...DEFAULT_DATA, otps: [] };
    }
  }

  write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    return data;
  }

  async getAll() {
    return this.read();
  }

  async save(data) {
    return this.write(data);
  }

  async getCollection(key) {
    const data = this.read();
    return data[key] || [];
  }

  async setCollection(key, value) {
    const data = this.read();
    data[key] = value;
    return this.write(data);
  }

  async update(fn) {
    const data = this.read();
    const updated = await fn(data);
    return this.write(updated);
  }
}

const DATA_FILE = path.join(__dirname, '..', '..', 'data.json');
export const db = new JsonDatabase(DATA_FILE);

export default db;
