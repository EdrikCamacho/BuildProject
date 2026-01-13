import { Component, inject, ChangeDetectorRef } from '@angular/core'; // Añadido ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './landing.component.html'
})
export class LandingComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // Inyectamos el detector de cambios

  loginData = { email: '', password: '' };
  submitted = false;
  showPassword = false;
  isLoading = false;
  errorMessage = ''; 

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    this.submitted = true;
    this.errorMessage = ''; 

    if (!this.loginData.email || !this.loginData.password) {
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges(); // Forzar para mostrar el spinner inmediatamente

    try {
      await this.authService.login(this.loginData.email, this.loginData.password);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.isLoading = false; 
      
      // Mapeo de errores estilo Facebook
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-email') {
        this.errorMessage = 'El correo electrónico o la contraseña que ingresaste no coinciden con ninguna cuenta. Regístrate para obtener una cuenta.';
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = 'Has intentado iniciar sesión demasiadas veces. Inténtalo de nuevo más tarde.';
      } else {
        this.errorMessage = 'No pudimos conectar con el servidor. Revisa tu conexión.';
      }

      // LA SOLUCIÓN: Forzamos a Angular a pintar el error y quitar el spinner
      this.cdr.detectChanges(); 
    }
  }
}