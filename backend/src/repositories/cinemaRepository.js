const path = require('path');
const { readJsonFile, writeJsonFile } = require('../utils/fileStorage');

const CINEMAS_FILE = path.join(__dirname, '../../data/cinemas.json');

class CinemaRepository {
  async getAll() {
    return await readJsonFile(CINEMAS_FILE, []);
  }

  async getById(id) {
    const cinemas = await this.getAll();
    return cinemas.find(c => c.id === id) || null;
  }

  async getByCity(city) {
    const cinemas = await this.getAll();
    if (!city) return cinemas;
    return cinemas.filter(c => c.city.toLowerCase() === city.toLowerCase());
  }

  async create(cinemaData) {
    const cinemas = await this.getAll();
    const newId = cinemaData.id || `CIN${String(cinemas.length + 1).padStart(3, '0')}`;
    const newCinema = {
      ...cinemaData,
      id: newId,
      isDemonstration: true
    };
    cinemas.push(newCinema);
    await writeJsonFile(CINEMAS_FILE, cinemas);
    return newCinema;
  }
}

module.exports = new CinemaRepository();
