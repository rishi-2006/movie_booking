const bookingService = require('../services/bookingService');
const bookingRepository = require('../repositories/bookingRepository');

const bookingController = {
  async create(req, res, next) {
    try {
      const { showId, seats, customer } = req.body;
      const booking = await bookingService.createBooking({ showId, seats, customer });
      res.status(201).json({
        success: true,
        message: 'Booking created successfully. This is a demonstration booking — no real payment was processed.',
        data: booking
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required for booking verification'
        });
      }

      const booking = await bookingRepository.getByIdAndEmail(id, email);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found. Please check your booking ID and email address.'
        });
      }

      res.json({ success: true, data: booking });
    } catch (err) {
      next(err);
    }
  },

  // Admin-only: get all bookings
  async getAll(req, res, next) {
    try {
      const bookings = await bookingRepository.getAll();
      const totalRevenue = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      res.json({
        success: true,
        data: bookings,
        total: bookings.length,
        stats: {
          totalBookings: bookings.length,
          confirmed: bookings.filter(b => b.status === 'confirmed').length,
          cancelled: bookings.filter(b => b.status === 'cancelled').length,
          totalRevenue
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const cancelled = await bookingService.cancelBooking(id);
      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: cancelled
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = bookingController;
