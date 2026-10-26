import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Movie, Cinema } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  readonly movies = signal<Movie[]>([]);
  readonly cinemas = signal<Cinema[]>([]);
  readonly loading = signal<boolean>(true);

  // Filters & Search
  readonly selectedGenre = signal<string>('All');
  readonly searchQuery = signal<string>('');

  // Hero Spotlight Index
  readonly heroIndex = signal<number>(0);

  // Quick Movie Details Modal
  readonly activeModalMovie = signal<Movie | null>(null);

  // Computed lists
  readonly nowShowingMovies = computed(() => {
    return this.movies().filter(m => m.status === 'now_showing');
  });

  readonly comingSoonMovies = computed(() => {
    return this.movies().filter(m => m.status === 'coming_soon');
  });

  readonly heroMovie = computed(() => {
    const list = this.nowShowingMovies();
    if (list.length === 0) return null;
    return list[this.heroIndex() % list.length];
  });

  readonly filteredNowShowing = computed(() => {
    let list = this.nowShowingMovies();
    const genre = this.selectedGenre();
    const query = this.searchQuery().trim().toLowerCase();

    if (genre !== 'All') {
      list = list.filter(m => m.genre.includes(genre));
    }
    if (query) {
      list = list.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.language.toLowerCase().includes(query) ||
        m.genre.some(g => g.toLowerCase().includes(query))
      );
    }
    return list;
  });

  readonly genres = ['All', 'Sci-Fi', 'Action', 'Drama', 'Adventure', 'Thriller'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getMovies().subscribe({
      next: (movies) => {
        this.movies.set(movies);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.api.getCinemas().subscribe({
      next: (cinemas) => this.cinemas.set(cinemas)
    });
  }

  setGenre(genre: string): void {
    this.selectedGenre.set(genre);
  }

  setHeroIndex(idx: number): void {
    this.heroIndex.set(idx);
  }

  openMovieDetails(movie: Movie): void {
    this.activeModalMovie.set(movie);
  }

  closeMovieDetails(): void {
    this.activeModalMovie.set(null);
  }

  bookMovie(movie: Movie): void {
    this.closeMovieDetails();
    this.router.navigate(['/shows'], { queryParams: { movieId: movie.id } });
  }
}
