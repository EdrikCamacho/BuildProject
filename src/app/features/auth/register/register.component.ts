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
  registerData = { 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: '' // Nuevo campo
  };

  // Estado visual
  showPassword = false;
  showConfirmPassword = false;
  passwordsDoNotMatch = false; // Para mostrar el error rojo

  constructor(private router: Router) {}

  onRegister() {
    // 1. Reiniciar errores
    this.passwordsDoNotMatch = false;

    // 2. Validación básica
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.passwordsDoNotMatch = true;
      return; // Detenemos el proceso si no coinciden
    }

    if (!this.registerData.password || !this.registerData.email) {
        return; // Validación simple de campos vacíos
    }

    console.log('Registrando:', this.registerData);
    // 3. Si todo está bien, avanzamos
    this.router.navigate(['/onboarding']);
  }

  // Funciones para los ojitos
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}