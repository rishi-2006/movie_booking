import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Movies } from './components/movies/movies';
import { Cinemas } from './components/cinemas/cinemas';
import { Shows } from './components/shows/shows';
import { Booking } from './components/booking/booking';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'movies', component: Movies },
  { path: 'cinemas', component: Cinemas },
  { path: 'shows', component: Shows },
  { path: 'booking/:showId', component: Booking },
  { path: '**', redirectTo: '' }
];
