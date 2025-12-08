import { Routes } from '@angular/router';
import { LandingComponent } from './features/auth/landing/landing.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { OnboardingComponent } from './features/onboarding/onboarding.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ExerciseListComponent } from './features/exercises/exercise-list/exercise-list.component';
import { ExerciseCreateComponent } from './features/exercises/exercise-create/exercise-create.component';
import { ExerciseDetailComponent } from './features/exercises/exercise-detail/exercise-detail.component';
import { MeasurementListComponent } from './features/measurements/measurement-list/measurement-list.component';
import { MeasurementAddComponent } from './features/measurements/measurement-add/measurement-add.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'exercises', component: ExerciseListComponent },
  { path: 'exercises/create', component: ExerciseCreateComponent },
  { path: 'exercises/:id', component: ExerciseDetailComponent },
  { path: 'measurements', component: MeasurementListComponent },
  { path: 'measurements/add', component: MeasurementAddComponent },
  // Redirección por defecto (opcional, pero recomendada)
  { path: '**', redirectTo: '' }
];