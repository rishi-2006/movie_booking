import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Movie, Cinema, Show } from '../../models';

interface GroupedCinemaShows {
  cinema: Cinema;
  shows: Show[];
}

@Component({
  selector: 'app-shows',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shows.html',
  styleUrl: './shows.css'
})
export class Shows implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly movies = signal<Movie[]>([]);
  readonly cinemas = signal<Cinema[]>([]);
  readonly shows = signal<Show[]>([]);
  readonly loading = signal<boolean>(true);

  // Selected filters
  readonly selectedMovieId = signal<string>('all');
  readonly selectedCinemaId = signal<string>('all');
  readonly selectedDate = signal<string>('2026-10-26');
  readonly selectedExperience = signal<string>('all');

  // Dates list for tabs
  readonly availableDates = [
    { date: '2026-10-26', label: 'Today', day: 'Mon, 26 Oct' },
    { date: '2026-10-27', label: 'Tomorrow', day: 'Tue, 27 Oct' },
    { date: '2026-10-28', label: 'Wednesday', day: 'Wed, 28 Oct' }
  ];

  // Currently focused movie (if filtered by a single movie)
  readonly focusedMovie = computed(() => {
    const id = this.selectedMovieId();
    if (id === 'all') return null;
    return this.movies().find(m => m.id === id) || null;
  });

  // Filtered shows
  readonly filteredShows = computed(() => {
    let list = this.shows();
    const movieId = this.selectedMovieId();
    const cinemaId = this.selectedCinemaId();
    const date = this.selectedDate();
    const exp = this.selectedExperience();

    if (movieId !== 'all') {
      list = list.filter(s => s.movieId === movieId);
    }
    if (cinemaId !== 'all') {
      list = list.filter(s => s.cinemaId === cinemaId);
    }
    if (date) {
      list = list.filter(s => s.date === date);
    }
    if (exp !== 'all') {
      list = list.filter(s => s.experience.toLowerCase().includes(exp.toLowerCase()));
    }

    return list;
  });

  // Grouped by cinema
  readonly cinemaGroups = computed(() => {
    const showsList = this.filteredShows();
    const cinemaMap = new Map<string, Show[]>();

    showsList.forEach(show => {
      if (!cinemaMap.has(show.cinemaId)) {
        cinemaMap.set(show.cinemaId, []);
      }
      cinemaMap.get(show.cinemaId)!.push(show);
    });

    const groups: GroupedCinemaShows[] = [];
    cinemaMap.forEach((cShows, cinemaId) => {
      const cinema = this.cinemas().find(c => c.id === cinemaId) || {
        id: cinemaId,
        name: 'CineBook Cinema',
        city: 'Hyderabad',
        location: 'City Center',
        screens: 4,
        facilities: ['Dolby Atmos']
      };
      groups.push({ cinema, shows: cShows });
    });

    return groups;
  });

  ngOnInit(): void {
    // Read query params
    this.route.queryParams.subscribe(params => {
      if (params['movieId']) {
        this.selectedMovieId.set(params['movieId']);
      }
      if (params['cinemaId']) {
        this.selectedCinemaId.set(params['cinemaId']);
      }
      if (params['date']) {
        this.selectedDate.set(params['date']);
      }
      this.loadAllData();
    });
  }

  loadAllData(): void {
    this.loading.set(true);

    this.api.getMovies().subscribe(m => this.movies.set(m));
    this.api.getCinemas().subscribe(c => this.cinemas.set(c));
    this.api.getShows().subscribe({
      next: (s) => {
        this.shows.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getMovieTitle(movieId: string): string {
    return this.movies().find(m => m.id === movieId)?.title || 'Movie';
  }

  getSeatsAvailable(show: Show): number {
    const total = (show.rows?.length || 6) * (show.seatsPerRow || 8);
    const booked = show.bookedSeats?.length || 0;
    return total - booked;
  }

  goToBooking(show: Show): void {
    this.router.navigate(['/booking', show.id]);
  }
}
