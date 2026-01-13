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

  // Variables exactas del HTML
  displayName: string = '';
  photoURL: string = ''; 
  loading: boolean = false;

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.displayName = user.displayName || '';
        this.photoURL = user.photoURL || '';
      }
    });
  }

  // Se activa al elegir el archivo
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // ASIGNACIÓN DIRECTA: Esto garantiza que la vista previa funcione al instante
        this.photoURL = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveProfile() {
    if (!this.displayName.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    this.loading = true;
    try {
      await this.authService.updateUserData(this.displayName, this.photoURL);
      this.router.navigate(['/profile']);
    } catch (error: any) {
      console.error("Error al guardar:", error);
      
      // EXPLICACIÓN DEL LÍMITE
      if (this.photoURL.startsWith('data:image')) {
        alert('El nombre se guardó, pero la foto es muy pesada para el sistema básico de Firebase Auth (Límite 2KB). Para fotos de alta calidad necesitamos configurar Firebase Storage.');
      } else {
        alert('Error al guardar los cambios.');
      }
    } finally {
      this.loading = false;
    }
  }
}