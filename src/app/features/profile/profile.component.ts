import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Interfaces para ordenar los datos
type Period = '1S' | '1M' | '3M' | '1A' | 'Todo';

interface WorkoutSummary {
  id: number;
  name: string;
  date: string;
  duration: string;
  volume: string;
  sets: number;
}

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
    photoUrl: '', // Pon una URL aquí para probar la imagen
    joinDate: 'Diciembre 2025',
    avatarLetter: 'A'
  };

  currentPeriod: Period = '1S';
  periods: Period[] = ['1S', '1M', '3M', '1A', 'Todo'];

  // Datos de estadísticas (sin cambios)
  analyticsData = {
    '1S': { volume: '12.5T', sets: 45, volumeTrend: [40, 60, 45, 80, 50, 70, 90], setsTrend: [50, 60, 55, 80, 60, 75, 85] },
    '1M': { volume: '54T', sets: 180, volumeTrend: [60, 75, 50, 90, 65, 85, 70], setsTrend: [70, 80, 60, 85, 75, 90, 80] },
    '3M': { volume: '160T', sets: 520, volumeTrend: [50, 60, 80, 70, 90, 85, 95], setsTrend: [60, 70, 80, 75, 85, 90, 100] },
    '1A': { volume: '620T', sets: 2100, volumeTrend: [30, 40, 45, 50, 60, 75, 90], setsTrend: [40, 50, 55, 60, 70, 80, 95] },
    'Todo': { volume: '850T', sets: 3500, volumeTrend: [20, 35, 50, 65, 70, 85, 100], setsTrend: [30, 40, 55, 70, 75, 90, 100] }
  };

  get currentStats() {
    return this.analyticsData[this.currentPeriod];
  }

  setPeriod(period: Period) {
    this.currentPeriod = period;
  }

  // CAMBIO 1: Quitamos 'Configuración' de aquí
  menuItems = [
    { title: 'Medidas Corporales', icon: '📏', desc: 'Registra tu peso y perímetros', route: '/measurements' },
    { title: 'Biblioteca de Ejercicios', icon: '📚', desc: 'Tutoriales e historial por ejercicio', route: '/exercises' },
    { title: 'Análisis Muscular', icon: 'anatomy', desc: 'Mapa de calor y simetría', route: '/muscles' }
  ];

  // CAMBIO 2: Nuevos datos para el historial de entrenamientos
  pastWorkouts: WorkoutSummary[] = [
    { id: 1, name: 'Pecho y Tríceps A', date: 'Hoy', duration: '1h 15m', volume: '4,520 kg', sets: 24 },
    { id: 2, name: 'Espalda y Bíceps B', date: 'Ayer', duration: '1h 05m', volume: '5,100 kg', sets: 22 },
    { id: 3, name: 'Pierna Completa', date: 'Lun 20 Ene', duration: '1h 30m', volume: '8,200 kg', sets: 28 },
    { id: 4, name: 'Hombro y Abs', date: 'Sab 18 Ene', duration: '55m', volume: '3,100 kg', sets: 18 }
  ];
}