import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile-edit.component.html'
})
export class ProfileEditComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  displayName: string = '';
  loading: boolean = false;

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.displayName = user.displayName || '';
      }
    });
  }

  async saveProfile() {
    if (!this.displayName.trim()) return;

    this.loading = true;
    try {
      // Corregido: Ahora solo enviamos el nombre
      await this.authService.updateUserData(this.displayName);
      this.router.navigate(['/profile']);
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      alert("No se pudieron guardar los cambios.");
    } finally {
      this.loading = false;
    }
  }
}