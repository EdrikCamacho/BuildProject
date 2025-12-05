import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.component.html'
})
export class OnboardingComponent {
  currentStep = 1; // Controla qué pregunta se ve
  userData = {
    gender: 'male', // 'male' | 'female'
    weight: 70,
    height: 170,
    goal: 'hypertrophy' // 'hypertrophy' | 'strength' | 'endurance'
  };

  constructor(private router: Router) {}

  nextStep() {
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  finishOnboarding() {
    console.log('Datos finales:', this.userData);
    this.router.navigate(['/dashboard']);
  }

  selectGender(gender: string) {
    this.userData.gender = gender;
  }

  selectGoal(goal: string) {
    this.userData.goal = goal;
  }
}