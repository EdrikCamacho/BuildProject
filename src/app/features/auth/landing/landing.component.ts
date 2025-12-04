import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para los inputs

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styles: []
})
export class LandingComponent {
  loginData = {
    email: '',
    password: ''
  };

  onLogin() {
    console.log('Iniciando sesión con:', this.loginData);
    // Aquí conectaremos con el backend más adelante
  }
}