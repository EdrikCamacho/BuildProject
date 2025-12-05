import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent {
  userName = 'Atleta';

  // Datos simulados de rutinas existentes
  routines = [
    {
      id: 1,
      name: 'Push Day - Hipertrofia',
      exercisesCount: 6,
      lastPerformed: 'Hace 2 días',
      tags: ['Pecho', 'Hombro', 'Tríceps']
    },
    {
      id: 2,
      name: 'Pull Day - Fuerza',
      exercisesCount: 5,
      lastPerformed: 'Ayer',
      tags: ['Espalda', 'Bíceps']
    },
    {
      id: 3,
      name: 'Leg Day Killer',
      exercisesCount: 7,
      lastPerformed: 'Hace 5 días',
      tags: ['Piernas', 'Glúteos']
    }
  ];

  createRoutine() {
    console.log('Navegar a crear rutina manual');
    // Aquí conectaremos con el componente de crear rutina más adelante
  }

  createWithAI() {
    console.log('Abrir modal de IA');
    // Aquí irá la integración futura con el backend de IA
  }
}