import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  Movie,
  Cinema,
  Show,
  ShowSeatsResponse,
  Booking,
  ApiResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api';

  // Fallback mock movies in case backend is offline
  private mockMovies: Movie[] = [
    {
      id: 'MOV001',
      title: 'Interstellar: Beyond Time',
      genre: ['Sci-Fi', 'Adventure', 'Drama'],
      language: 'English',
      duration: 169,
      rating: 8.7,
      releaseDate: '2024-10-15',
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
      status: 'now_showing',
      ticketPrice: 280
    },
    {
      id: 'MOV002',
      title: 'Dune: Prophecy of Arrakis',
      genre: ['Sci-Fi', 'Action', 'Adventure'],
      language: 'English',
      duration: 166,
      rating: 8.5,
      releaseDate: '2024-03-01',
      poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe.',
      director: 'Denis Villeneuve',
      cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
      status: 'now_showing',
      ticketPrice: 320
    },
    {
      id: 'MOV003',
      title: 'Devara: Part 1',
      genre: ['Action', 'Drama', 'Thriller'],
      language: 'Telugu',
      duration: 178,
      rating: 8.1,
      releaseDate: '2024-09-27',
      poster: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      backdrop: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
      description: 'An epic action saga set across coastal lands, following an intrepid warrior striving to protect his people from illicit smuggling syndicates and family betrayal.',
      director: 'Koratala Siva',
      cast: ['N.T. Rama Rao Jr.', 'Janhvi Kapoor', 'Saif Ali Khan', 'Prakash Raj'],
      status: 'now_showing',
      ticketPrice: 250
    },
    {
      id: 'MOV004',
      title: 'Kalki 2898 AD',
      genre: ['Sci-Fi', 'Action', 'Mythology'],
      language: 'Telugu',
      duration: 181,
      rating: 8.3,
      releaseDate: '2024-06-27',
      poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      backdrop: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      description: 'A modern avatar of Vishnu, a Hindu god, who is believed to have descended to earth to protect the world from evil forces in a dystopian futuristic Kasi.',
      director: 'Nag Ashwin',
      cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone'],
      status: 'now_showing',
      ticketPrice: 300
    },
    {
      id: 'MOV005',
      title: 'Blade Runner 2099',
      genre: ['Sci-Fi', 'Thriller', 'Mystery'],
      language: 'English',
      duration: 155,
      rating: 8.8,
      releaseDate: '2026-11-20',
      poster: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      backdrop: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80',
      description: 'In the neon depths of Los Angeles fifty years later, a synthetic detective uncovers a conspiracy that challenges the definition of synthetic and organic life.',
      director: 'Ridley Scott',
      cast: ['Michelle Yeoh', 'Hunter Schafer', 'Tom Burke'],
      status: 'coming_soon',
      ticketPrice: 350
    },
    {
      id: 'MOV006',
      title: 'Avatar: Fire and Ash',
      genre: ['Sci-Fi', 'Adventure', 'Fantasy'],
      language: 'English',
      duration: 190,
      rating: 8.9,
      releaseDate: '2026-12-19',
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      backdrop: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80',
      description: 'Jake Sully and Neytiri encounter a aggressive volcanic clan of Na\'vi known as the Ash People on Pandora.',
      director: 'James Cameron',
      cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Oona Chaplin'],
      status: 'coming_soon',
      ticketPrice: 350
    }
  ];

  private mockCinemas: Cinema[] = [
    {
      id: 'CIN001',
      name: 'CineBook IMAX & 4DX — Banjara Hills',
      city: 'Hyderabad',
      location: 'Road No. 2, Banjara Hills, Hyderabad, Telangana',
      screens: 6,
      facilities: ['IMAX Laser', 'Dolby Atmos 7.1', 'Recliner Seats', 'Gourmet Dining', 'Valet Parking']
    },
    {
      id: 'CIN002',
      name: 'CineBook Luxe Multiplex — Hitec City',
      city: 'Hyderabad',
      location: 'Cyber Towers Junction, Hitec City, Hyderabad, Telangana',
      screens: 8,
      facilities: ['4K RGB Laser', 'Dolby Atmos', 'VIP Lounge', 'In-Seat Ordering']
    },
    {
      id: 'CIN003',
      name: 'CineBook Heritage Cinema — Abids',
      city: 'Hyderabad',
      location: 'Station Road, Abids, Hyderabad, Telangana',
      screens: 4,
      facilities: ['Barco 4K Projection', 'Dolby Surround 5.1', 'Cafeteria']
    },
    {
      id: 'CIN004',
      name: 'CineBook Grand Arena — Koramangala',
      city: 'Bengaluru',
      location: '80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka',
      screens: 7,
      facilities: ['Dolby Atmos', '4K Projection', 'Food Court', 'Parking']
    },
    {
      id: 'CIN005',
      name: 'CineBook Royale Cinema — Bandra West',
      city: 'Mumbai',
      location: 'Linking Road, Bandra West, Mumbai, Maharashtra',
      screens: 5,
      facilities: ['IMAX Laser', 'Dolby Atmos', 'Valet Parking', 'Luxury Recliners']
    }
  ];

  private mockShows: Show[] = [
    {
      id: 'SHW001',
      movieId: 'MOV001',
      cinemaId: 'CIN001',
      date: '2026-10-26',
      time: '10:30 AM',
      screen: 'Audi 1 (IMAX)',
      experience: 'IMAX Laser 2D',
      ticketPrice: 280,
      rows: ['A', 'B', 'C', 'D', 'E', 'F'],
      seatsPerRow: 8,
      bookedSeats: ['A3', 'A4', 'C5', 'D2', 'D3']
    },
    {
      id: 'SHW002',
      movieId: 'MOV001',
      cinemaId: 'CIN001',
      date: '2026-10-26',
      time: '02:15 PM',
      screen: 'Audi 1 (IMAX)',
      experience: 'IMAX Laser 2D',
      ticketPrice: 280,
      rows: ['A', 'B', 'C', 'D', 'E', 'F'],
      seatsPerRow: 8,
      bookedSeats: ['B1', 'B2']
    },
    {
      id: 'SHW003',
      movieId: 'MOV001',
      cinemaId: 'CIN001',
      date: '2026-10-26',
      time: '06:45 PM',
      screen: 'Audi 1 (IMAX)',
      experience: 'IMAX Laser 2D',
      ticketPrice: 300,
      rows: ['A', 'B', 'C', 'D', 'E', 'F'],
      seatsPerRow: 8,
      bookedSeats: ['C3', 'C4', 'C5', 'C6', 'E4', 'E5']
    },
    {
      id: 'SHW004',
      movieId: 'MOV002',
      cinemaId: 'CIN001',
      date: '2026-10-26',
      time: '11:00 AM',
      screen: 'Audi 2 (Dolby Atmos)',
      experience: 'Dolby Atmos 4K',
      ticketPrice: 320,
      rows: ['A', 'B', 'C', 'D', 'E', 'F'],
      seatsPerRow: 8,
      bookedSeats: ['A1', 'A2', 'D4', 'D5']
    },
    {
      id: 'SHW005',
      movieId: 'MOV002',
      cinemaId: 'CIN002',
      date: '2026-10-26',
      time: '04:00 PM',
      screen: 'Screen 1 (Luxe)',
      experience: '4K Laser RGB',
      ticketPrice: 320,
      rows: ['A', 'B', 'C', 'D', 'E', 'F'],
      seatsPerRow: 8,
      bookedSeats: ['B4', 'B5']
    },
    {
      id: 'SHW006',
      movieId: 'MOV003',
      cinemaId: 'CIN001',
      date: '2026-10-26',
      time: '01:00 PM',
      screen: 'Audi 3',
      experience: 'Dolby Atmos',
      ticketPrice: 250,
      rows: ['A', 'B', 'C', 'D', 'E', 'F'],
      seatsPerRow: 8,
      bookedSeats: ['C1', 'C2']
    },
    {
      id: 'SHW007',
      movieId: 'MOV004',
      cinemaId: 'CIN002',
      date: '2026-10-26',
      time: '07:30 PM',
      screen: 'Audi 1 (IMAX)',
      experience: 'IMAX 3D Laser',
      ticketPrice: 320,
      rows: ['A', 'B', 'C', 'D', 'E', 'F'],
      seatsPerRow: 8,
      bookedSeats: ['B3', 'B4', 'C3', 'C4']
    }
  ];

  // Local in-memory bookings storage for fallback
  private mockBookings: Booking[] = [
    {
      id: 'CB202610269911',
      showId: 'SHW001',
      movieTitle: 'Interstellar: Beyond Time',
      cinemaName: 'CineBook IMAX & 4DX — Banjara Hills',
      showDate: '2026-10-26',
      showTime: '10:30 AM',
      screen: 'Audi 1 (IMAX)',
      experience: 'IMAX Laser 2D',
      seats: ['A3', 'A4'],
      ticketPrice: 280,
      subtotal: 560,
      tax: 70.8,
      totalAmount: 630.8,
      customer: {
        name: 'Rishi Kumar',
        email: 'rishi@example.com',
        phone: '9876543210'
      },
      status: 'confirmed',
      createdAt: '2026-10-26T09:30:00.000Z'
    }
  ];

  // Movies
  getMovies(): Observable<Movie[]> {
    return this.http.get<ApiResponse<Movie[]>>(`${this.baseUrl}/movies`).pipe(
      map(res => res.data),
      catchError(() => of(this.mockMovies))
    );
  }

  getMovieById(id: string): Observable<Movie | undefined> {
    return this.http.get<ApiResponse<Movie>>(`${this.baseUrl}/movies/${id}`).pipe(
      map(res => res.data),
      catchError(() => of(this.mockMovies.find(m => m.id === id)))
    );
  }

  // Cinemas
  getCinemas(): Observable<Cinema[]> {
    return this.http.get<ApiResponse<Cinema[]>>(`${this.baseUrl}/cinemas`).pipe(
      map(res => res.data),
      catchError(() => of(this.mockCinemas))
    );
  }

  getCinemaById(id: string): Observable<Cinema | undefined> {
    return this.http.get<ApiResponse<Cinema>>(`${this.baseUrl}/cinemas/${id}`).pipe(
      map(res => res.data),
      catchError(() => of(this.mockCinemas.find(c => c.id === id)))
    );
  }

  // Shows
  getShows(filters?: { movieId?: string; cinemaId?: string; date?: string }): Observable<Show[]> {
    let queryParams: string[] = [];
    if (filters?.movieId) queryParams.push(`movieId=${encodeURIComponent(filters.movieId)}`);
    if (filters?.cinemaId) queryParams.push(`cinemaId=${encodeURIComponent(filters.cinemaId)}`);
    if (filters?.date) queryParams.push(`date=${encodeURIComponent(filters.date)}`);
    const qs = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    return this.http.get<ApiResponse<Show[]>>(`${this.baseUrl}/shows${qs}`).pipe(
      map(res => res.data),
      catchError(() => {
        let results = [...this.mockShows];
        if (filters?.movieId) results = results.filter(s => s.movieId === filters.movieId);
        if (filters?.cinemaId) results = results.filter(s => s.cinemaId === filters.cinemaId);
        if (filters?.date) results = results.filter(s => s.date === filters.date);
        return of(results);
      })
    );
  }

  getShowById(id: string): Observable<Show | undefined> {
    return this.http.get<ApiResponse<Show>>(`${this.baseUrl}/shows/${id}`).pipe(
      map(res => res.data),
      catchError(() => of(this.mockShows.find(s => s.id === id)))
    );
  }

  getShowSeats(showId: string): Observable<ShowSeatsResponse> {
    return this.http.get<ApiResponse<ShowSeatsResponse>>(`${this.baseUrl}/shows/${showId}/seats`).pipe(
      map(res => res.data),
      catchError(() => {
        const show = this.mockShows.find(s => s.id === showId) || this.mockShows[0];
        const rows = show.rows || ['A', 'B', 'C', 'D', 'E', 'F'];
        const seatsPerRow = show.seatsPerRow || 8;
        const booked = show.bookedSeats || [];

        const seatMap = rows.map(row => ({
          row,
          seats: Array.from({ length: seatsPerRow }, (_, i) => {
            const seatId = `${row}${i + 1}`;
            return {
              id: seatId,
              row,
              number: i + 1,
              isBooked: booked.includes(seatId)
            };
          })
        }));

        const response: ShowSeatsResponse = {
          showId: show.id,
          movieId: show.movieId,
          cinemaId: show.cinemaId,
          screen: show.screen,
          experience: show.experience,
          ticketPrice: show.ticketPrice,
          totalSeats: rows.length * seatsPerRow,
          bookedCount: booked.length,
          availableCount: (rows.length * seatsPerRow) - booked.length,
          seatMap
        };
        return of(response);
      })
    );
  }

  // Bookings
  createBooking(payload: {
    showId: string;
    seats: string[];
    customer: { name: string; email: string; phone: string };
  }): Observable<{ success: boolean; message: string; data: Booking }> {
    return this.http.post<ApiResponse<Booking>>(`${this.baseUrl}/bookings`, payload).pipe(
      map(res => ({
        success: res.success,
        message: res.message || 'Booking successful',
        data: res.data
      })),
      catchError(err => {
        // If backend returned actual API error (like 400 with message), throw it
        if (err instanceof HttpErrorResponse && err.error?.message) {
          return throwError(() => new Error(err.error.message));
        }

        // Mock fallback if server is unreachable
        const show = this.mockShows.find(s => s.id === payload.showId) || this.mockShows[0];
        const movie = this.mockMovies.find(m => m.id === show.movieId);
        const cinema = this.mockCinemas.find(c => c.id === show.cinemaId);

        // Mark seats as booked locally
        payload.seats.forEach(s => {
          if (!show.bookedSeats.includes(s)) {
            show.bookedSeats.push(s);
          }
        });

        const subtotal = payload.seats.length * show.ticketPrice;
        const convenienceFee = payload.seats.length * 30;
        const gst = convenienceFee * 0.18;
        const totalAmount = Math.round((subtotal + convenienceFee + gst) * 100) / 100;

        const newBooking: Booking = {
          id: `CB${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(1000 + Math.random() * 9000)}`,
          showId: show.id,
          movieTitle: movie?.title || 'Selected Movie',
          cinemaName: cinema?.name || 'CineBook Screen',
          showDate: show.date,
          showTime: show.time,
          screen: show.screen,
          experience: show.experience,
          seats: payload.seats,
          ticketPrice: show.ticketPrice,
          subtotal,
          tax: Math.round((convenienceFee + gst) * 100) / 100,
          totalAmount,
          customer: payload.customer,
          status: 'confirmed',
          createdAt: new Date().toISOString()
        };

        this.mockBookings.push(newBooking);

        return of({
          success: true,
          message: 'Booking created successfully (Demonstration Mode — no real payment was processed).',
          data: newBooking
        });
      })
    );
  }

  getBookingByIdAndEmail(id: string, email: string): Observable<Booking | null> {
    const url = `${this.baseUrl}/bookings/${encodeURIComponent(id)}?email=${encodeURIComponent(email)}`;
    return this.http.get<ApiResponse<Booking>>(url).pipe(
      map(res => res.data),
      catchError(() => {
        const found = this.mockBookings.find(
          b => b.id.toLowerCase() === id.trim().toLowerCase() &&
               b.customer.email.toLowerCase() === email.trim().toLowerCase()
        );
        return of(found || null);
      })
    );
  }
}
