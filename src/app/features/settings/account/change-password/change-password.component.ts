import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  constructor(private router: Router) {}

  save() {
    // Validaciones
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

    console.log('Cambiando contraseña...');
    // Aquí llamada al backend
    
    alert('Contraseña actualizada correctamente.');
    this.router.navigate(['/settings/account']);
  }

  // Helpers para los ojitos
  toggleCurrent() { this.showCurrent = !this.showCurrent; }
  toggleNew() { this.showNew = !this.showNew; }
  toggleConfirm() { this.showConfirm = !this.showConfirm; }
}