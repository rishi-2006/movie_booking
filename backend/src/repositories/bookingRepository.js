const path = require('path');
const { readJsonFile, writeJsonFile } = require('../utils/fileStorage');

const BOOKINGS_FILE = path.join(__dirname, '../../data/bookings.json');

class BookingRepository {
  async getAll() {
    return await readJsonFile(BOOKINGS_FILE, []);
  }

  async getById(bookingId) {
    const bookings = await this.getAll();
    return bookings.find(b => b.bookingId === bookingId) || null;
  }

  async getByIdAndEmail(bookingId, email) {
    const bookings = await this.getAll();
    const normalizedEmail = (email || '').trim().toLowerCase();
    return bookings.find(b => 
      b.bookingId.toLowerCase() === bookingId.trim().toLowerCase() && 
      b.customer && 
      b.customer.email.toLowerCase() === normalizedEmail
    ) || null;
  }

  async create(booking) {
    const bookings = await this.getAll();
    bookings.unshift(booking); // newest first
    await writeJsonFile(BOOKINGS_FILE, bookings);
    return booking;
  }

  async updateStatus(bookingId, status) {
    const bookings = await this.getAll();
    const index = bookings.findIndex(b => b.bookingId === bookingId);
    if (index === -1) return null;

    bookings[index].status = status;
    bookings[index].updatedAt = new Date().toISOString();
    await writeJsonFile(BOOKINGS_FILE, bookings);
    return bookings[index];
  }
}

module.exports = new BookingRepository();
