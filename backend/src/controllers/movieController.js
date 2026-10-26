const movieRepository = require('../repositories/movieRepository');

const movieController = {
  async getAll(req, res, next) {
    try {
      let movies = await movieRepository.getAll();

      // Search by title
      if (req.query.search) {
        const search = req.query.search.toLowerCase();
        movies = movies.filter(m => m.title.toLowerCase().includes(search));
      }

      // Filter by genre
      if (req.query.genre) {
        const genre = req.query.genre.toLowerCase();
        movies = movies.filter(m => m.genre && m.genre.some(g => g.toLowerCase() === genre));
      }

      // Filter by language
      if (req.query.language) {
        const lang = req.query.language.toLowerCase();
        movies = movies.filter(m => m.language && m.language.toLowerCase() === lang);
      }

      // Filter by status
      if (req.query.status) {
        movies = movies.filter(m => m.status === req.query.status);
      }

      // Sort by rating
      if (req.query.sort === 'rating_desc') {
        movies.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (req.query.sort === 'rating_asc') {
        movies.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      }

      res.json({ success: true, data: movies, total: movies.length });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const movie = await movieRepository.getById(req.params.id);
      if (!movie) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }
      res.json({ success: true, data: movie });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { title, genre, language, duration, rating, releaseDate, poster, description, status, ticketPrice, director, cast, backdrop } = req.body;
      if (!title || !genre || !language) {
        return res.status(400).json({ success: false, message: 'Title, genre, and language are required' });
      }
      const newMovie = await movieRepository.create({
        title, genre, language, duration, rating, releaseDate, poster, description, status: status || 'now_showing',
        ticketPrice: ticketPrice || 250, director, cast, backdrop
      });
      res.status(201).json({ success: true, message: 'Movie added successfully', data: newMovie });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await movieRepository.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }
      res.json({ success: true, message: 'Movie updated successfully', data: updated });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const deleted = await movieRepository.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }
      res.json({ success: true, message: 'Movie deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = movieController;
