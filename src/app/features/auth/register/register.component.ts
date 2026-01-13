import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '' // Añadido para el HTML
  };
  
  loading = false;
  submitted = false; // Añadido para las validaciones del HTML
  showPassword = false; // Añadido para el icono del ojo
  showConfirmPassword = false; // Añadido para el icono del ojo

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Cambiado de onSubmit a onRegister para coincidir con tu HTML
  async onRegister() {
    this.submitted = true;

    // Validación básica de coincidencia
    if (this.registerData.password !== this.registerData.confirmPassword) {
      return;
    }

    if (!this.registerData.name || !this.registerData.email || !this.registerData.password) {
      return;
    }

    this.loading = true;
    try {
      const credential = await this.authService.register(
        this.registerData.email, 
        this.registerData.password
      );
      
      if (credential.user) {
        await this.authService.updateUserData(this.registerData.name);
      }
      
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error("Error en registro:", error);
      alert("Error al crear la cuenta: " + error.message);
    } finally {
      this.loading = false;
    }
  }
}