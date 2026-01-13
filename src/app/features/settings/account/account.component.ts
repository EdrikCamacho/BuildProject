// src/app/features/settings/account/account.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service'; // Importamos el servicio

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account.component.html'
})
export class AccountComponent {

  constructor(
    private router: Router,
    private authService: AuthService // Inyectamos el AuthService
  ) {}

  changeEmail() {
    this.router.navigate(['/settings/account/email']);
  }

  changePassword() {
    this.router.navigate(['/settings/account/password']);
  }

  async deleteAccount() {
    // Mantenemos tu validación de confirmación
    const confirmDelete = confirm('¿Estás SEGURO? Esta acción borrará todos tus datos y no se puede deshacer.');
    
    if (confirmDelete) {
      try {
        console.log('Intentando eliminar cuenta en Firebase...');
        
        // Ejecutamos el borrado en Firebase
        await this.authService.deleteAccount();
        
        alert('Tu cuenta ha sido eliminada con éxito.');
        this.router.navigate(['/']); 
        
      } catch (error: any) {
        // Manejo del error de seguridad de Firebase
        if (error.code === 'auth/requires-recent-login') {
          alert('Por seguridad, esta acción requiere que hayas iniciado sesión recientemente. Por favor, cierra sesión y vuelve a entrar antes de intentar eliminar tu cuenta.');
        } else {
          alert('Error al eliminar la cuenta: ' + error.message);
        }
      }
    }
  }
}