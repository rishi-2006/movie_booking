const path = require('path');
const { readJsonFile, writeJsonFile } = require('../utils/fileStorage');

const USERS_FILE = path.join(__dirname, '../../data/users.json');

class UserRepository {
  async getAll() {
    return await readJsonFile(USERS_FILE, []);
  }

  async findByEmail(email) {
    const users = await this.getAll();
    const normalized = (email || '').trim().toLowerCase();
    return users.find(u => u.email.toLowerCase() === normalized) || null;
  }

  async findById(id) {
    const users = await this.getAll();
    return users.find(u => u.id === id) || null;
  }
}

module.exports = new UserRepository();
