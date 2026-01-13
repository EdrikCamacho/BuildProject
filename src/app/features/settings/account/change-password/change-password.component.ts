import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service'; // Importación del servicio

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent {
  form = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Estados de visibilidad para cada campo
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  constructor(
    private router: Router,
    private authService: AuthService // Inyección del servicio
  ) {}

  async save() {
    // Validaciones existentes
    if (!this.form.currentPassword || !this.form.newPassword || !this.form.confirmPassword) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    if (this.form.newPassword.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (this.form.newPassword !== this.form.confirmPassword) {
      alert('Las nuevas contraseñas no coinciden.');
      return;
    }

    if (this.form.currentPassword === this.form.newPassword) {
      alert('La nueva contraseña debe ser diferente a la actual.');
      return;
    }

    try {
      console.log('Cambiando contraseña...');
      
      // Llamada a Firebase a través del servicio
      await this.authService.updatePassword(this.form.newPassword);
      
      alert('Contraseña actualizada correctamente.');
      this.router.navigate(['/settings/account']);
      
    } catch (error: any) {
      // Manejo de error específico de Firebase cuando la sesión es antigua
      if (error.code === 'auth/requires-recent-login') {
        alert('Por seguridad, esta operación requiere que hayas iniciado sesión recientemente. Por favor, cierra sesión y vuelve a entrar.');
      } else {
        alert('Error al actualizar la contraseña: ' + error.message);
      }
    }
  }

  // Helpers para los ojitos (sin cambios)
  toggleCurrent() { this.showCurrent = !this.showCurrent; }
  toggleNew() { this.showNew = !this.showNew; }
  toggleConfirm() { this.showConfirm = !this.showConfirm; }
}