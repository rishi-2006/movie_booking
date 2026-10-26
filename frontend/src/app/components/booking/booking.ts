import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Show, Movie, Cinema, ShowSeatsResponse, Booking as BookingModel } from '../../models';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  // Show & Seat map details
  readonly showId = signal<string>('');
  readonly showDetails = signal<Show | null>(null);
  readonly movie = signal<Movie | null>(null);
  readonly cinema = signal<Cinema | null>(null);
  readonly seatData = signal<ShowSeatsResponse | null>(null);

  readonly loading = signal<boolean>(true);
  readonly bookingSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // Selected seats (e.g. ['A1', 'A2'])
  readonly selectedSeats = signal<string[]>([]);

  // Customer form inputs
  readonly customerName = signal<string>('');
  readonly customerEmail = signal<string>('');
  readonly customerPhone = signal<string>('');

  // Confirmed booking state (triggers success modal receipt)
  readonly confirmedBooking = signal<BookingModel | null>(null);

  // Price computations
  readonly ticketPrice = computed(() => {
    return this.showDetails()?.ticketPrice || 280;
  });

  readonly seatsCount = computed(() => {
    return this.selectedSeats().length;
  });

  readonly subtotal = computed(() => {
    return this.seatsCount() * this.ticketPrice();
  });

  readonly convenienceFee = computed(() => {
    return this.seatsCount() * 30; // ₹30 per seat
  });

  readonly gstTax = computed(() => {
    // 18% GST on convenience fee
    return Math.round(this.convenienceFee() * 0.18 * 100) / 100;
  });

  readonly totalAmount = computed(() => {
    return Math.round((this.subtotal() + this.convenienceFee() + this.gstTax()) * 100) / 100;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('showId') || 'SHW001';
      this.showId.set(id);
      this.loadShowData(id);
    });
  }

  loadShowData(id: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api.getShowById(id).subscribe({
      next: (show) => {
        if (!show) {
          this.errorMessage.set('Show not found. Please select an available show from the timetable.');
          this.loading.set(false);
          return;
        }
        this.showDetails.set(show);

        // Fetch associated movie and cinema
        this.api.getMovieById(show.movieId).subscribe(m => this.movie.set(m || null));
        this.api.getCinemaById(show.cinemaId).subscribe(c => this.cinema.set(c || null));

        // Fetch live seat availability
        this.api.getShowSeats(id).subscribe({
          next: (seatResp) => {
            this.seatData.set(seatResp);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      },
      error: () => {
        this.errorMessage.set('Failed to load show details. Please check connection.');
        this.loading.set(false);
      }
    });
  }

  isSeatSelected(seatId: string): boolean {
    return this.selectedSeats().includes(seatId);
  }

  isSeatBooked(seatId: string): boolean {
    const seatMap = this.seatData()?.seatMap || [];
    for (const r of seatMap) {
      const found = r.seats.find(s => s.id === seatId);
      if (found) return found.isBooked;
    }
    return false;
  }

  toggleSeat(seatId: string): void {
    if (this.isSeatBooked(seatId)) return;

    const current = this.selectedSeats();
    if (current.includes(seatId)) {
      this.selectedSeats.set(current.filter(s => s !== seatId));
      this.errorMessage.set(null);
    } else {
      if (current.length >= 10) {
        this.errorMessage.set('Maximum 10 tickets can be booked per transaction.');
        return;
      }
      this.selectedSeats.set([...current, seatId]);
      this.errorMessage.set(null);
    }
  }

  removeSeat(seatId: string): void {
    this.selectedSeats.update(seats => seats.filter(s => s !== seatId));
  }

  processBooking(): void {
    const seats = this.selectedSeats();
    const name = this.customerName().trim();
    const email = this.customerEmail().trim();
    const phone = this.customerPhone().trim();

    if (seats.length === 0) {
      this.errorMessage.set('Please select at least one seat from the auditorium map.');
      return;
    }

    if (!name || !email || !phone) {
      this.errorMessage.set('Please fill in your name, email, and phone number.');
      return;
    }

    // Basic email format check
    if (!email.includes('@') || !email.includes('.')) {
      this.errorMessage.set('Please provide a valid email address for e-ticket delivery.');
      return;
    }

    this.bookingSubmitting.set(true);
    this.errorMessage.set(null);

    const payload = {
      showId: this.showId(),
      seats,
      customer: { name, email, phone }
    };

    this.api.createBooking(payload).subscribe({
      next: (response) => {
        this.bookingSubmitting.set(false);
        if (response.success && response.data) {
          this.confirmedBooking.set(response.data);
          // Refresh seat map to mark booked seats
          this.loadShowData(this.showId());
        } else {
          this.errorMessage.set(response.message || 'Booking could not be confirmed.');
        }
      },
      error: (err) => {
        this.bookingSubmitting.set(false);
        this.errorMessage.set(err?.message || 'Error creating booking. The chosen seats may have just been taken.');
      }
    });
  }

  printTicket(): void {
    window.print();
  }

  finishAndGoHome(): void {
    this.confirmedBooking.set(null);
    this.router.navigate(['/']);
  }
}
