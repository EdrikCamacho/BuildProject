import { Routes } from '@angular/router';
import { LandingComponent } from './features/auth/landing/landing.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { OnboardingComponent } from './features/onboarding/onboarding.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  { 
    path: 'register', 
    component: RegisterComponent 
  },
  { 
    path: 'onboarding', 
    component: OnboardingComponent 
  },
  {
    path: 'dashboard',
    component: DashboardComponent // Nueva ruta
  }
  // Más adelante agregaremos 'dashboard', 'workouts', etc.
];