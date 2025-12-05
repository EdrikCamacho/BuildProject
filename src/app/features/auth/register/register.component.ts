import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  registerData = { name: '', email: '', password: '' };

  constructor(private router: Router) {}

  onRegister() {
    console.log('Registrando:', this.registerData);
    // Simulamos registro exitoso y vamos al Onboarding
    this.router.navigate(['/onboarding']);
  }
}