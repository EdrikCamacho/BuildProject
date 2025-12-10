import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WorkoutService } from '../../../core/services/workout.service';
import { ActiveWorkout } from '../../../core/models/workout.model';

@Component({
  selector: 'app-workout-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout-summary.component.html'
})
export class WorkoutSummaryComponent implements OnInit, OnDestroy {
  
  workout: ActiveWorkout | null = null;
  workoutDescription = '';
  currentDate = new Date();
  
  private timerSubscription: Subscription | undefined;

  constructor(
    private workoutService: WorkoutService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.workout = this.workoutService.activeWorkout;

    if (!this.workout) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Suscribirse al reloj para que la duración avance en pantalla
    this.timerSubscription = this.workoutService.timerTick$.subscribe(() => {
      this.currentDate = new Date();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
  }

  get durationDisplay(): string {
    return this.workoutService.formatTime(this.workout?.durationSeconds || 0);
  }

  // CÁLCULO DE VOLUMEN REAL
  get totalVolume(): number {
    if (!this.workout) return 0;
    return this.workout.exercises.reduce((total, ex) => {
      const exerciseVol = ex.sets.reduce((setAcc, s) => {
        if (s.completed && s.weight && s.reps) {
          return setAcc + (s.weight * s.reps);
        }
        return setAcc;
      }, 0);
      return total + exerciseVol;
    }, 0);
  }
  
  get totalSets(): number {
    if (!this.workout) return 0;
    return this.workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  }

  resumeWorkout() {
    this.router.navigate(['/tracker']);
  }

  saveWorkout() {
    if (this.workout) {
      this.workout.volume = this.totalVolume;
      this.workout.endTime = new Date(); // Establecer fecha fin
      
      // NUEVO: Guardar en el historial
      this.workoutService.saveToHistory(this.workout);
    }

    console.log('Guardando...', this.workout);
    this.workoutService.stopWorkout(); // Limpiar activo
    
    alert('¡Entrenamiento guardado en tu historial!');
    this.router.navigate(['/profile']); // Ir al perfil para verlo
  }

  discardWorkout() {
    if (confirm('¿Estás SEGURO de descartar? Se perderá todo el progreso.')) {
      this.workoutService.stopWorkout();
      this.router.navigate(['/dashboard']);
    }
  }

  addPhoto() {
    alert('Funcionalidad de cámara/galería (Próximamente)');
  }
}