import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './profile-edit.component.html'
})
export class ProfileEditComponent implements OnInit {
  // Datos del usuario (Simulación: esto vendría de un servicio)
  user = {
    name: '',
    photoUrl: '',
    avatarLetter: ''
  };
  
  // Para manejar la previsualización de la nueva imagen
  previewImage: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // Simular carga de datos actuales
    this.user = {
      name: 'Atleta',
      photoUrl: '', // Empieza vacío para ver el icono de cámara
      avatarLetter: 'A'
    };
    this.previewImage = this.user.photoUrl || null;
  }

  // Simulación de click en el input file
  triggerPhotoUpload() {
    console.log('Abriendo selector de archivos...');
    // Simulamos que el usuario seleccionó una nueva imagen
    // En el futuro, aquí leerías el archivo real del input
    this.previewImage = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop';
  }

  save() {
    console.log('Guardando perfil...', { name: this.user.name, newPhoto: this.previewImage });
    // Aquí llamarías al servicio para actualizar en el backend
    
    // Redirigir de vuelta al perfil
    this.router.navigate(['/profile']);
  }
}