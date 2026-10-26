import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Movie } from '../../models';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movies.html',
  styleUrl: './movies.css'
})
export class Movies implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  readonly movies = signal<Movie[]>([]);
  readonly loading = signal<boolean>(true);

  // Filters
  readonly statusFilter = signal<'all' | 'now_showing' | 'coming_soon'>('all');
  readonly selectedLanguage = signal<string>('All');
  readonly selectedGenre = signal<string>('All');
  readonly sortBy = signal<'rating' | 'release' | 'price'>('rating');
  readonly searchQuery = signal<string>('');

  // Selected for preview modal
  readonly selectedMovie = signal<Movie | null>(null);

  readonly languages = ['All', 'English', 'Telugu', 'Hindi'];
  readonly genres = ['All', 'Sci-Fi', 'Action', 'Drama', 'Adventure', 'Thriller', 'Mythology'];

  readonly filteredMovies = computed(() => {
    let list = [...this.movies()];

    // Status
    if (this.statusFilter() !== 'all') {
      list = list.filter(m => m.status === this.statusFilter());
    }

    // Language
    if (this.selectedLanguage() !== 'All') {
      list = list.filter(m => m.language === this.selectedLanguage());
    }

    // Genre
    if (this.selectedGenre() !== 'All') {
      list = list.filter(m => m.genre.includes(this.selectedGenre()));
    }

    // Search query
    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      list = list.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.director.toLowerCase().includes(query) ||
        m.cast.some(c => c.toLowerCase().includes(query)) ||
        m.genre.some(g => g.toLowerCase().includes(query))
      );
    }

    // Sorting
    if (this.sortBy() === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (this.sortBy() === 'release') {
      list.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
    } else if (this.sortBy() === 'price') {
      list.sort((a, b) => a.ticketPrice - b.ticketPrice);
    }

    return list;
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.api.getMovies().subscribe({
      next: (data) => {
        this.movies.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  selectMovie(m: Movie): void {
    this.selectedMovie.set(m);
  }

  closeModal(): void {
    this.selectedMovie.set(null);
  }

  bookMovie(m: Movie): void {
    this.closeModal();
    this.router.navigate(['/shows'], { queryParams: { movieId: m.id } });
  }
}
