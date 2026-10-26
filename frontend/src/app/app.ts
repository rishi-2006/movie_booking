import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { Booking } from './models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private api = inject(ApiService);

  readonly selectedCity = signal<string>('Hyderabad');
  readonly cities = ['Hyderabad', 'Bengaluru', 'Mumbai', 'Delhi NCR'];

  // Verification modal state
  readonly isLookupModalOpen = signal<boolean>(false);
  readonly lookupBookingId = signal<string>('');
  readonly lookupEmail = signal<string>('');
  readonly lookupLoading = signal<boolean>(false);
  readonly lookupError = signal<string | null>(null);
  readonly lookedUpBooking = signal<Booking | null>(null);

  // Mobile menu
  readonly isMobileMenuOpen = signal<boolean>(false);

  setCity(city: string) {
    this.selectedCity.set(city);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  openLookupModal() {
    this.isLookupModalOpen.set(true);
    this.lookupError.set(null);
    this.lookedUpBooking.set(null);
  }

  closeLookupModal() {
    this.isLookupModalOpen.set(false);
  }

  searchBooking() {
    const id = this.lookupBookingId().trim();
    const email = this.lookupEmail().trim();

    if (!id || !email) {
      this.lookupError.set('Please provide both Booking ID and registered Email address.');
      return;
    }

    this.lookupLoading.set(true);
    this.lookupError.set(null);

    this.api.getBookingByIdAndEmail(id, email).subscribe({
      next: (booking) => {
        this.lookupLoading.set(false);
        if (booking) {
          this.lookedUpBooking.set(booking);
        } else {
          this.lookupError.set('No confirmed booking was found matching this Booking ID and Email.');
        }
      },
      error: (err) => {
        this.lookupLoading.set(false);
        this.lookupError.set(err?.message || 'Failed to verify booking. Please try again.');
      }
    });
  }
}
