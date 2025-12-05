import { Routes } from '@angular/router';
import { LandingComponent } from './features/auth/landing/landing.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent // Nueva ruta
  }
  // Más adelante agregaremos 'dashboard', 'workouts', etc.
];