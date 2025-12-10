import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { WorkoutService } from '../../core/services/workout.service';
import { ActiveWorkout } from '../../core/models/workout.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  // ... (Variables de usuario y stats siguen igual) ...
  user = { name: 'Atleta', photoUrl: '', joinDate: 'Diciembre 2025', avatarLetter: 'A' };
  currentPeriod: any = '1S';
  periods: any[] = ['1S', '1M', '3M', '1A', 'Todo'];
  analyticsData: any = { '1S': { volume: '12.5T', sets: 45, volumeTrend: [40, 60, 45, 80, 50, 70, 90], setsTrend: [50, 60, 55, 80, 60, 75, 85] } };
  get currentStats() { return this.analyticsData['1S']; }
  setPeriod(p: any) { this.currentPeriod = p; }
  
  menuItems = [
    { title: 'Medidas Corporales', icon: '📏', desc: 'Registra tu peso y perímetros', route: '/measurements' },
    { title: 'Biblioteca de Ejercicios', icon: '📚', desc: 'Tutoriales e historial por ejercicio', route: '/exercises' },
    { title: 'Análisis Muscular', icon: 'anatomy', desc: 'Mapa de calor y simetría', route: '/muscles' }
  ];

  history: ActiveWorkout[] = [];
  
  // NUEVO: Control del menú activo (ID del workout)
  activeMenuId: string | null = null;

  constructor(public workoutService: WorkoutService, private router: Router) {}

  ngOnInit() {
    this.workoutService.history$.subscribe(data => {
      this.history = data;
    });
  }

  getSetsCount(workout: ActiveWorkout): number {
    return workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  }

  viewWorkoutDetail(id: string) {
    this.router.navigate(['/history', id]);
  }

  // --- NUEVAS FUNCIONES DEL MENÚ ---

  toggleMenu(id: string, event: Event) {
    event.stopPropagation(); // Evita ir al detalle
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  closeMenu() {
    this.activeMenuId = null;
  }

  repeatWorkout(workout: ActiveWorkout, event: Event) {
    event.stopPropagation();
    this.closeMenu();

    // 1. Iniciamos un entrenamiento limpio en el servicio
    this.workoutService.startNewWorkout();

    // 2. Sobrescribimos con los datos del historial (pero limpiando estado)
    if (this.workoutService.activeWorkout) {
      this.workoutService.activeWorkout.name = workout.name;
      
      // Copiamos ejercicios y sets, pero reseteamos 'completed' a false
      this.workoutService.activeWorkout.exercises = workout.exercises.map(ex => ({
        ...ex,
        tempId: Date.now().toString() + Math.random(), // Nuevos IDs temporales
        sets: ex.sets.map(s => ({ ...s, completed: false })) // Resetear checks
      }));
    }

    // 3. Vamos al tracker
    this.router.navigate(['/tracker']);
  }

  deleteWorkout(id: string, event: Event) {
    event.stopPropagation();
    this.closeMenu();
    
    if (confirm('¿Eliminar este entrenamiento del historial?')) {
      this.workoutService.deleteFromHistory(id);
    }
  }
}