import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { WorkoutService } from '../../core/services/workout.service'; // Importar servicio

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent {
  userName = 'Atleta';
  routines = [
    { id: 1, name: 'Push Day - Hipertrofia', exercisesCount: 6, lastPerformed: 'Hace 2 días', tags: ['Pecho', 'Hombro', 'Tríceps'] },
    { id: 2, name: 'Pull Day - Fuerza', exercisesCount: 5, lastPerformed: 'Ayer', tags: ['Espalda', 'Bíceps'] },
    { id: 3, name: 'Leg Day Killer', exercisesCount: 7, lastPerformed: 'Hace 5 días', tags: ['Piernas', 'Glúteos'] }
  ];

  // Inyectar WorkoutService
  constructor(private router: Router, private workoutService: WorkoutService) {}

  startEmptyWorkout() {
    console.log('Iniciando entrenamiento vacío...');
    // 1. Iniciar sesión en el servicio
    this.workoutService.startNewWorkout();
    // 2. Navegar al tracker
    this.router.navigate(['/tracker']);
  }

  createRoutine() { console.log('Navegar a crear rutina manual'); }
  createWithAI() { console.log('Abrir modal de IA'); }
}