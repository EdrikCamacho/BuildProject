import { Routes } from '@angular/router';
import { LandingComponent } from './features/auth/landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  // Más adelante agregaremos 'dashboard', 'workouts', etc.
];