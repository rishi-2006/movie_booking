export interface Movie {
  id: string;
  title: string;
  genre: string[];
  language: string;
  duration: number;
  rating: number;
  releaseDate: string;
  poster: string;
  backdrop: string;
  description: string;
  director: string;
  cast: string[];
  status: 'now_showing' | 'coming_soon';
  ticketPrice: number;
}

export interface Cinema {
  id: string;
  name: string;
  city: string;
  location: string;
  screens: number;
  facilities: string[];
  isDemonstration?: boolean;
}

export interface Show {
  id: string;
  movieId: string;
  cinemaId: string;
  date: string;
  time: string;
  screen: string;
  experience: string;
  ticketPrice: number;
  rows: string[];
  seatsPerRow: number;
  bookedSeats: string[];
}

export interface SeatInfo {
  id: string;
  row: string;
  number: number;
  isBooked: boolean;
}

export interface RowSeats {
  row: string;
  seats: SeatInfo[];
}

export interface ShowSeatsResponse {
  showId: string;
  movieId: string;
  cinemaId: string;
  screen: string;
  experience: string;
  ticketPrice: number;
  totalSeats: number;
  bookedCount: number;
  availableCount: number;
  seatMap: RowSeats[];
}

export interface BookingCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: string;
  showId: string;
  movieTitle: string;
  cinemaName: string;
  showDate: string;
  showTime: string;
  screen: string;
  experience?: string;
  seats: string[];
  ticketPrice: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
  customer: BookingCustomer;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  poster?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}
