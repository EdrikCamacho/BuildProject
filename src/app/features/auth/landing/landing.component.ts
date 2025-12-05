import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // <--- Importamos el Router

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styles: []
})
export class LandingComponent {
  loginData = { email: '', password: '' };
  showPassword = false;

  // Inyectamos el Router en el constructor
  constructor(private router: Router) {}

  onLogin() { 
    console.log('Login:', this.loginData);
    // Redirigimos al dashboard al hacer click en Entrar
    this.router.navigate(['/dashboard']); 
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}