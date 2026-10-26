const showRepository = require('../repositories/showRepository');

const showController = {
  async getAll(req, res, next) {
    try {
      const filter = {};
      if (req.query.movieId) filter.movieId = req.query.movieId;
      if (req.query.cinemaId) filter.cinemaId = req.query.cinemaId;
      if (req.query.date) filter.date = req.query.date;

      const shows = await showRepository.getAll(filter);
      res.json({ success: true, data: shows, total: shows.length });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const show = await showRepository.getById(req.params.id);
      if (!show) {
        return res.status(404).json({ success: false, message: 'Show not found' });
      }
      res.json({ success: true, data: show });
    } catch (err) {
      next(err);
    }
  },

  async getSeats(req, res, next) {
    try {
      const show = await showRepository.getById(req.params.id);
      if (!show) {
        return res.status(404).json({ success: false, message: 'Show not found' });
      }

      const rows = show.rows || ['A', 'B', 'C', 'D', 'E', 'F'];
      const seatsPerRow = show.seatsPerRow || 8;
      const bookedSeats = show.bookedSeats || [];

      // Build seat map
      const seatMap = [];
      for (const row of rows) {
        const rowSeats = [];
        for (let i = 1; i <= seatsPerRow; i++) {
          const seatId = `${row}${i}`;
          rowSeats.push({
            id: seatId,
            row,
            number: i,
            isBooked: bookedSeats.includes(seatId)
          });
        }
        seatMap.push({ row, seats: rowSeats });
      }

      res.json({
        success: true,
        data: {
          showId: show.id,
          screen: show.screen,
          experience: show.experience,
          ticketPrice: show.ticketPrice,
          totalSeats: rows.length * seatsPerRow,
          bookedCount: bookedSeats.length,
          availableCount: (rows.length * seatsPerRow) - bookedSeats.length,
          seatMap
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = showController;
