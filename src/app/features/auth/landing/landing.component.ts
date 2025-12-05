import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './landing.component.html',
  styles: []
})
export class LandingComponent {
  loginData = { email: '', password: '' };
  showPassword = false;
  
  // Bandera para saber si se intentó enviar el formulario
  submitted = false;

  constructor(private router: Router) {}

  onLogin() { 
    this.submitted = true; // Activamos las validaciones visuales

    // 1. Validar campos vacíos
    if (!this.loginData.email || !this.loginData.password) {
      return; // Detenemos si falta algo
    }

    // 2. Validar formato de email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginData.email)) {
      return; // Detenemos si el email no es válido
    }

    console.log('Login Exitoso:', this.loginData);
    this.router.navigate(['/dashboard']); 
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}