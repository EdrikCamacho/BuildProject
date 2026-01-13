import { Component, inject } from '@angular/core'; // Agregamos inject
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service'; // Importar servicio

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private authService = inject(AuthService); // Inyectar servicio
  private router = inject(Router);

  registerData = { name: '', email: '', password: '', confirmPassword: '' };
  showPassword = false;
  showConfirmPassword = false;
  submitted = false;
  errorMessage = ''; // Para mostrar errores en el HTML

  // Cambiamos a async para esperar a Firebase
  async onRegister() {
    this.submitted = true;
    this.errorMessage = '';

    // Validaciones básicas (se mantienen igual)...
    if (!this.registerData.name || !this.registerData.email || !this.registerData.password || !this.registerData.confirmPassword) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) return; 
    if (this.registerData.password.length < 6) return;
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    // --- Lógica de Firebase ---
    try {
      await this.authService.register(
        this.registerData.name,
        this.registerData.email,
        this.registerData.password
      );
      console.log('Usuario registrado con éxito');
      this.router.navigate(['/onboarding']); // Redirigir al terminar
    } catch (error: any) {
      console.error('Error en registro:', error);
      // Manejo básico de errores de Firebase
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'Este correo ya está registrado.';
      } else {
        this.errorMessage = 'Ocurrió un error. Intenta nuevamente.';
      }
    }
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }
}