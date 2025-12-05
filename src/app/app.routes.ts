import { Routes } from '@angular/router';
import { LandingComponent } from './features/auth/landing/landing.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { OnboardingComponent } from './features/onboarding/onboarding.component';
import { ProfileComponent } from './features/profile/profile.component';

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
  },
  { 
    path: 'profile', 
    component: ProfileComponent 
  }
  // Más adelante agregaremos 'dashboard', 'workouts', etc.
];