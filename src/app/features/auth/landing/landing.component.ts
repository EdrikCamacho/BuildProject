import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styles: []
})
export class LandingComponent {
  loginData = { email: '', password: '' };
  
  // Variable para controlar si se ve la contraseña
  showPassword = false;

  onLogin() { 
    console.log('Login:', this.loginData); 
  }

  // Función para alternar el estado
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}