const path = require('path');
const { readJsonFile, writeJsonFile } = require('../utils/fileStorage');

const SHOWS_FILE = path.join(__dirname, '../../data/shows.json');

class ShowRepository {
  async getAll(filter = {}) {
    let shows = await readJsonFile(SHOWS_FILE, []);
    if (filter.movieId) {
      shows = shows.filter(s => s.movieId === filter.movieId);
    }
    if (filter.cinemaId) {
      shows = shows.filter(s => s.cinemaId === filter.cinemaId);
    }
    if (filter.date) {
      shows = shows.filter(s => s.date === filter.date);
    }
    return shows;
  }

  async getById(id) {
    const shows = await readJsonFile(SHOWS_FILE, []);
    return shows.find(s => s.id === id) || null;
  }

  /**
   * Reserves seats atomically for a show.
   * If any of the requested seats are already booked, returns { success: false, conflictSeats: [...] }
   */
  async reserveSeats(showId, seatsToBook) {
    const shows = await readJsonFile(SHOWS_FILE, []);
    const index = shows.findIndex(s => s.id === showId);
    if (index === -1) {
      return { success: false, reason: 'Show not found' };
    }

    const show = shows[index];
    const currentBooked = show.bookedSeats || [];
    
    // Check conflicts
    const conflictSeats = seatsToBook.filter(seat => currentBooked.includes(seat));
    if (conflictSeats.length > 0) {
      return { success: false, conflictSeats };
    }

    // Reserve
    show.bookedSeats = [...currentBooked, ...seatsToBook];
    shows[index] = show;
    await writeJsonFile(SHOWS_FILE, shows);

    return { success: true, show };
  }

  /**
   * Releases seats (for cancellation)
   */
  async releaseSeats(showId, seatsToRelease) {
    const shows = await readJsonFile(SHOWS_FILE, []);
    const index = shows.findIndex(s => s.id === showId);
    if (index === -1) return false;

    const show = shows[index];
    show.bookedSeats = (show.bookedSeats || []).filter(s => !seatsToRelease.includes(s));
    shows[index] = show;
    await writeJsonFile(SHOWS_FILE, shows);
    return true;
  }

  async create(showData) {
    const shows = await readJsonFile(SHOWS_FILE, []);
    const newId = showData.id || `SHW${String(shows.length + 1).padStart(3, '0')}`;
    const newShow = {
      ...showData,
      id: newId,
      bookedSeats: showData.bookedSeats || [],
      rows: showData.rows || ["A", "B", "C", "D", "E", "F"],
      seatsPerRow: showData.seatsPerRow || 8
    };
    shows.push(newShow);
    await writeJsonFile(SHOWS_FILE, shows);
    return newShow;
  }
}

module.exports = new ShowRepository();
