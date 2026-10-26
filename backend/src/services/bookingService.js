const movieRepository = require('../repositories/movieRepository');
const cinemaRepository = require('../repositories/cinemaRepository');
const showRepository = require('../repositories/showRepository');
const bookingRepository = require('../repositories/bookingRepository');
const { serialize } = require('../utils/fileStorage');

class BookingService {
  /**
   * Generates a unique booking ID (e.g., CB202610264789)
   */
  generateBookingId() {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    return `CB${dateStr}${randomHex}`;
  }

  /**
   * Complete atomic booking process
   */
  async createBooking({ showId, seats, customer }) {
    // 1. Basic validation
    if (!showId) {
      const err = new Error('Show ID is required');
      err.status = 400;
      throw err;
    }

    if (!Array.isArray(seats) || seats.length === 0) {
      const err = new Error('At least one seat must be selected');
      err.status = 400;
      throw err;
    }

    if (seats.length > 10) {
      const err = new Error('Maximum 10 seats allowed per booking');
      err.status = 400;
      throw err;
    }

    // Format seats (uppercase, unique)
    const normalizedSeats = [...new Set(seats.map(s => String(s).trim().toUpperCase()))];
    if (normalizedSeats.length !== seats.length) {
      const err = new Error('Duplicate seats in request');
      err.status = 400;
      throw err;
    }

    // Customer validation
    if (!customer || !customer.name || !customer.email || !customer.phone) {
      const err = new Error('Customer name, valid email, and phone number are required');
      err.status = 400;
      throw err;
    }

    // Mutex lock on booking flow using showId as serialization key
    return await serialize(`booking_${showId}`, async () => {
      // 2. Fetch fresh show details
      const show = await showRepository.getById(showId);
      if (!show) {
        const err = new Error('Selected show not found');
        err.status = 404;
        throw err;
      }

      // Check seat format against valid rows
      const validRows = show.rows || ['A', 'B', 'C', 'D', 'E', 'F'];
      const seatsPerRow = show.seatsPerRow || 8;

      for (const seat of normalizedSeats) {
        const row = seat[0];
        const num = parseInt(seat.slice(1), 10);
        if (!validRows.includes(row) || isNaN(num) || num < 1 || num > seatsPerRow) {
          const err = new Error(`Seat ${seat} is not a valid seat for this auditorium`);
          err.status = 400;
          throw err;
        }
      }

      // 3. Check seat availability and atomically reserve
      const reservation = await showRepository.reserveSeats(showId, normalizedSeats);
      if (!reservation.success) {
        if (reservation.conflictSeats) {
          const err = new Error(`Seats already booked: ${reservation.conflictSeats.join(', ')}. Please select different seats.`);
          err.status = 409;
          err.conflictSeats = reservation.conflictSeats;
          throw err;
        }
        const err = new Error(reservation.reason || 'Failed to reserve seats');
        err.status = 400;
        throw err;
      }

      // 4. Calculate total price strictly server-side using current show/movie price
      const unitPrice = show.ticketPrice;
      const totalAmount = unitPrice * normalizedSeats.length;

      // 5. Gather rich metadata for booking record
      const movie = await movieRepository.getById(show.movieId);
      const cinema = await cinemaRepository.getById(show.cinemaId);

      const bookingId = this.generateBookingId();
      const bookingRecord = {
        bookingId,
        showId,
        movieId: show.movieId,
        movieTitle: movie ? movie.title : 'Movie',
        poster: movie ? movie.poster : '',
        cinemaId: show.cinemaId,
        cinemaName: cinema ? cinema.name : 'Cinema',
        city: cinema ? cinema.city : '',
        location: cinema ? cinema.location : '',
        date: show.date,
        time: show.time,
        screen: show.screen,
        experience: show.experience,
        seats: normalizedSeats,
        ticketPrice: unitPrice,
        totalAmount,
        status: 'confirmed',
        customer: {
          name: customer.name.trim(),
          email: customer.email.trim().toLowerCase(),
          phone: customer.phone.trim()
        },
        paymentNote: 'Demonstration booking: no real payment was processed',
        createdAt: new Date().toISOString()
      };

      try {
        await bookingRepository.create(bookingRecord);
      } catch (writeErr) {
        // Rollback seat reservation if booking record save fails
        await showRepository.releaseSeats(showId, normalizedSeats);
        const err = new Error('Failed to record booking. The transaction was rolled back.');
        err.status = 500;
        throw err;
      }

      return bookingRecord;
    });
  }

  async cancelBooking(bookingId) {
    const booking = await bookingRepository.getById(bookingId);
    if (!booking) {
      const err = new Error('Booking not found');
      err.status = 404;
      throw err;
    }

    if (booking.status === 'cancelled') {
      const err = new Error('Booking is already cancelled');
      err.status = 400;
      throw err;
    }

    // Release seats in the show
    await showRepository.releaseSeats(booking.showId, booking.seats);
    return await bookingRepository.updateStatus(bookingId, 'cancelled');
  }
}

module.exports = new BookingService();
