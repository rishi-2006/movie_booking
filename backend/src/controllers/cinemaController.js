const cinemaRepository = require('../repositories/cinemaRepository');

const cinemaController = {
  async getAll(req, res, next) {
    try {
      let cinemas;
      if (req.query.city) {
        cinemas = await cinemaRepository.getByCity(req.query.city);
      } else {
        cinemas = await cinemaRepository.getAll();
      }
      res.json({ success: true, data: cinemas, total: cinemas.length });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const cinema = await cinemaRepository.getById(req.params.id);
      if (!cinema) {
        return res.status(404).json({ success: false, message: 'Cinema not found' });
      }
      res.json({ success: true, data: cinema });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = cinemaController;
