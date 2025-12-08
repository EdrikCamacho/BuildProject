import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necesario para los inputs

@Component({
  selector: 'app-change-email',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './change-email.component.html'
})
export class ChangeEmailComponent implements OnInit {
  // Datos del formulario
  form = {
    currentEmail: '',
    newEmail: '',
    password: ''
  };

  constructor(private router: Router) {}

  ngOnInit() {
    // Aquí cargarías el email real del usuario desde tu servicio de autenticación
    this.form.currentEmail = 'usuario@ejemplo.com'; 
  }

  save() {
    // Validación básica
    if (!this.form.newEmail || !this.form.password) {
      alert('Por favor, introduce el nuevo correo y tu contraseña para confirmar.');
      return;
    }

    if (this.form.newEmail === this.form.currentEmail) {
       alert('El nuevo correo debe ser diferente al actual.');
       return;
    }

    console.log('Intentando cambiar email...', this.form);
    // Aquí iría la llamada al backend para verificar contraseña y actualizar email
    
    alert('Se ha enviado un enlace de verificación a tu nuevo correo.');
    this.router.navigate(['/settings/account']);
  }
}