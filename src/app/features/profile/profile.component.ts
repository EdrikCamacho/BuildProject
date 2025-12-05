import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Definimos los tipos de periodo válidos
type Period = '1S' | '1M' | '3M' | '1A' | 'Todo';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styles: []
})
export class ProfileComponent {
  user = {
    name: 'Atleta',
    username: '@usuario',
    joinDate: 'Diciembre 2025',
    level: 'Intermedio',
    avatarLetter: 'A'
  };

  // Estado del periodo seleccionado (Por defecto 1 Semana)
  currentPeriod: Period = '1S';
  periods: Period[] = ['1S', '1M', '3M', '1A', 'Todo'];

  // Datos simulados para cada periodo (Volumen y Series)
  // 'trend' son valores del 0 al 100 para dibujar las barritas
  analyticsData = {
    '1S': { 
      volume: '12.5T', 
      sets: 45, 
      volumeTrend: [40, 60, 45, 80, 50, 70, 90], 
      setsTrend: [50, 60, 55, 80, 60, 75, 85] 
    },
    '1M': { 
      volume: '54T', 
      sets: 180, 
      volumeTrend: [60, 75, 50, 90, 65, 85, 70], 
      setsTrend: [70, 80, 60, 85, 75, 90, 80] 
    },
    '3M': { 
      volume: '160T', 
      sets: 520, 
      volumeTrend: [50, 60, 80, 70, 90, 85, 95], 
      setsTrend: [60, 70, 80, 75, 85, 90, 100] 
    },
    '1A': { 
      volume: '620T', 
      sets: 2100, 
      volumeTrend: [30, 40, 45, 50, 60, 75, 90], 
      setsTrend: [40, 50, 55, 60, 70, 80, 95] 
    },
    'Todo': { 
      volume: '850T', 
      sets: 3500, 
      volumeTrend: [20, 35, 50, 65, 70, 85, 100], 
      setsTrend: [30, 40, 55, 70, 75, 90, 100] 
    }
  };

  // Getter para obtener los datos del periodo actual fácilmente en el HTML
  get currentStats() {
    return this.analyticsData[this.currentPeriod];
  }

  setPeriod(period: Period) {
    this.currentPeriod = period;
  }

  menuItems = [
    { title: 'Medidas Corporales', icon: '📏', desc: 'Registra tu peso y perímetros', route: '/measurements' },
    { title: 'Biblioteca de Ejercicios', icon: '📚', desc: 'Tutoriales e historial por ejercicio', route: '/exercises' },
    { title: 'Análisis Muscular', icon: 'anatomy', desc: 'Mapa de calor y simetría', route: '/muscles' },
    { title: 'Configuración', icon: '⚙️', desc: 'Cuenta, notificaciones y tema', route: '/settings' }
  ];
}