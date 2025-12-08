import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account.component.html'
})
export class AccountComponent {

  constructor(private router: Router) {}

  changeEmail() {
    this.router.navigate(['/settings/account/email']);
  }

  changePassword() {
    this.router.navigate(['/settings/account/password']);
  }

  deleteAccount() {
    const confirmDelete = confirm('¿Estás SEGURO? Esta acción borrará todos tus datos y no se puede deshacer.');
    if (confirmDelete) {
      console.log('Cuenta eliminada');
      this.router.navigate(['/']); 
    }
  }
}