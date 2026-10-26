import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Cinema } from '../../models';

@Component({
  selector: 'app-cinemas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cinemas.html',
  styleUrl: './cinemas.css'
})
export class Cinemas implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  readonly cinemas = signal<Cinema[]>([]);
  readonly loading = signal<boolean>(true);
  readonly selectedCity = signal<string>('All');
  readonly searchQuery = signal<string>('');

  readonly cities = computed(() => {
    const list = this.cinemas().map(c => c.city);
    return ['All', ...new Set(list)];
  });

  readonly filteredCinemas = computed(() => {
    let list = this.cinemas();
    const city = this.selectedCity();
    const query = this.searchQuery().trim().toLowerCase();

    if (city !== 'All') {
      list = list.filter(c => c.city.toLowerCase() === city.toLowerCase());
    }

    if (query) {
      list = list.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query) ||
        c.facilities.some(f => f.toLowerCase().includes(query))
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.api.getCinemas().subscribe({
      next: (data) => {
        this.cinemas.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  viewCinemaShows(cinema: Cinema): void {
    this.router.navigate(['/shows'], { queryParams: { cinemaId: cinema.id } });
  }
}
