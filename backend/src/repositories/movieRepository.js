const path = require('path');
const { readJsonFile, writeJsonFile } = require('../utils/fileStorage');

const MOVIES_FILE = path.join(__dirname, '../../data/movies.json');

class MovieRepository {
  async getAll() {
    return await readJsonFile(MOVIES_FILE, []);
  }

  async getById(id) {
    const movies = await this.getAll();
    return movies.find(m => m.id === id) || null;
  }

  async create(movieData) {
    const movies = await this.getAll();
    const newId = movieData.id || `MOV${String(movies.length + 1).padStart(3, '0')}`;
    const newMovie = {
      ...movieData,
      id: newId,
      createdAt: new Date().toISOString()
    };
    movies.push(newMovie);
    await writeJsonFile(MOVIES_FILE, movies);
    return newMovie;
  }

  async update(id, updateData) {
    const movies = await this.getAll();
    const index = movies.findIndex(m => m.id === id);
    if (index === -1) return null;

    movies[index] = {
      ...movies[index],
      ...updateData,
      id // preserve ID
    };
    await writeJsonFile(MOVIES_FILE, movies);
    return movies[index];
  }

  async delete(id) {
    const movies = await this.getAll();
    const index = movies.findIndex(m => m.id === id);
    if (index === -1) return false;

    movies.splice(index, 1);
    await writeJsonFile(MOVIES_FILE, movies);
    return true;
  }
}

module.exports = new MovieRepository();
