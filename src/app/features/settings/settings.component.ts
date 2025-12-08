import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

interface SettingItem {
  title: string;
  icon: string;
  route: string;
  desc?: string;
}

interface SettingGroup {
  title: string;
  items: SettingItem[];
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './settings.component.html'
})
export class SettingsComponent {

  settingGroups: SettingGroup[] = [
    {
      title: 'General',
      items: [
        { 
          title: 'Perfil', 
          icon: '👤', 
          route: '/profile/edit', 
          desc: 'Editar foto, nombre y detalles' 
        },
        { 
          title: 'Cuenta', 
          icon: '🔒', 
          route: '/settings/account', 
          desc: 'Email, contraseña y seguridad' 
        }
      ]
    }
  ];

  constructor(private router: Router) {}

  handleNavigation(item: SettingItem) {
    this.router.navigate([item.route]);
  }

  // FUNCIÓN PARA CERRAR SESIÓN
  logout() {
    console.log('Cerrando sesión...');
    // Aquí iría la lógica real de borrar tokens, etc.
    this.router.navigate(['/']); // Redirige al Landing/Login
  }
}