import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoutineService } from '../../../core/services/routine.service'; // Importamos el servicio de rutinas

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private routineService = inject(RoutineService); // Inyectamos el servicio
  private router = inject(Router);

  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  loading = false;
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onRegister() {
    this.submitted = true;

    // Validación de coincidencia
    if (this.registerData.password !== this.registerData.confirmPassword) {
      return;
    }

    if (!this.registerData.name || !this.registerData.email || !this.registerData.password) {
      return;
    }

    this.loading = true;
    try {
      // 1. Registro en Firebase Auth
      const credential = await this.authService.register(
        this.registerData.email, 
        this.registerData.password
      );
      
      if (credential.user) {
        // 2. Actualizamos el nombre en el perfil
        await this.authService.updateUserData(this.registerData.name);
        
        // 3. --- NUEVO: Creamos las rutinas por defecto para este UID ---
        console.log('Creando rutinas iniciales para:', credential.user.uid);
        await this.routineService.createDefaultRoutines(credential.user.uid);
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