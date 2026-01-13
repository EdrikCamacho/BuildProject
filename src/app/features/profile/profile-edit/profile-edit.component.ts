import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
    if (!this.displayName.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    this.loading = true;
    try {
      // Llamamos al servicio solo con el nombre
      await this.authService.updateUserData(this.displayName);
      this.router.navigate(['/profile']);
    } catch (error: any) {
      console.error("Error al guardar:", error);
      alert('Error al guardar los cambios.');
    } finally {
      this.loading = false;
    }
  }
}