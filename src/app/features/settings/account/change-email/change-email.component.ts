import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-change-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './change-email.component.html'
})
export class ChangeEmailComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  newEmail: string = '';
  loading: boolean = false;

  async saveEmail() {
    if (!this.newEmail || !this.newEmail.includes('@')) {
      alert('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    this.loading = true;
    try {
      await this.authService.changeEmail(this.newEmail);
      alert('Correo electrónico actualizado correctamente.');
      this.router.navigate(['/settings/account']);
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        alert('Por seguridad, debes cerrar sesión y volver a entrar para realizar este cambio.');
      } else {
        alert('Error al actualizar: ' + error.message);
      }
    } finally {
      this.loading = false;
    }
  }
}