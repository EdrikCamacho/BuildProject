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
  registerData = { name: '', email: '', password: '', confirmPassword: '' };
  
  showPassword = false;
  showConfirmPassword = false;
  
  // Bandera de envío
  submitted = false;

  constructor(private router: Router) {}

  onRegister() {
    this.submitted = true;

    // 1. Validar campos vacíos
    if (!this.registerData.name || !this.registerData.email || !this.registerData.password || !this.registerData.confirmPassword) {
      return;
    }

    // 2. Validar Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      return; 
    }

    // 3. Validar longitud contraseña (min 6)
    if (this.registerData.password.length < 6) {
      return;
    }

    // 4. Validar coincidencia
    if (this.registerData.password !== this.registerData.confirmPassword) {
      return;
    }

    console.log('Registrando:', this.registerData);
    this.router.navigate(['/onboarding']);
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }
}