import { Component, inject, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { WorkoutService } from '../../core/services/workout.service';
import { AuthService } from '../../core/services/auth.service';
import { ActiveWorkout } from '../../core/models/workout.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit, OnDestroy {
  public workoutService = inject(WorkoutService);
  private router = inject(Router);
  public authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  user = { name: 'Atleta', photoUrl: '', joinDate: 'Diciembre 2025', avatarLetter: 'A' };
  currentPeriod: any = '1S';
  periods: any[] = ['1S', '1M', '3M', '1A', 'Todo'];
  analyticsData: any = { 
    '1S': { volume: '12.5T', sets: 45, volumeTrend: [40, 60, 45, 80, 50, 70, 90], setsTrend: [50, 60, 55, 80, 60, 75, 85] } 
  };
  
  get currentStats() { return this.analyticsData['1S']; }
  setPeriod(p: any) { this.currentPeriod = p; }

  menuItems = [
    { title: 'Medidas Corporales', icon: '📏', desc: 'Registra tu peso y perímetros', route: '/measurements' },
    { title: 'Biblioteca de Ejercicios', icon: '📚', desc: 'Tutoriales e historial por ejercicio', route: '/exercises' },
    { title: 'Análisis Muscular', icon: 'anatomy', desc: 'Mapa de calor y simetría', route: '/muscles' }
  ];

  history$ = this.workoutService.history$;
  activeMenuId: string | null = null;
  private historySub?: Subscription;

  ngOnInit() {
    // Forzamos la detección de cambios cuando el historial emite datos
    this.historySub = this.history$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.historySub?.unsubscribe();
  }

  getSetsCount(workout: ActiveWorkout): number {
    if (!workout.exercises) return 0;
    return workout.exercises.reduce((acc, ex) => acc + (ex.sets ? ex.sets.filter(s => s.completed).length : 0), 0);
  }

  viewWorkoutDetail(id: string) {
    this.router.navigate(['/history', id]);
  }

  toggleMenu(id: string, event: Event) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  closeMenu() {
    this.activeMenuId = null;
  }

  repeatWorkout(workout: ActiveWorkout, event: Event) {
    event.stopPropagation();
    this.closeMenu();
    this.workoutService.startNewWorkout();
    if (this.workoutService.activeWorkout) {
      this.workoutService.activeWorkout.name = workout.name;
      this.workoutService.activeWorkout.exercises = workout.exercises.map(ex => ({
        ...ex,
        tempId: Date.now().toString() + Math.random(),
        sets: ex.sets.map(s => ({ ...s, completed: false }))
      }));
    }
    this.router.navigate(['/workout/active']);
  }

  deleteWorkout(id: string | undefined, event: Event) {
    event.stopPropagation();
    this.closeMenu();
    if (!id) return;
    if (confirm('¿Eliminar este entrenamiento del historial?')) {
      this.workoutService.deleteFromHistory(id);
    }
  }
}