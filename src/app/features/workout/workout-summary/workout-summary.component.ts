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

    // Actualizar reloj y fecha en tiempo real
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

  // --- CÁLCULO DE VOLUMEN (NUEVO) ---
  get totalVolume(): number {
    if (!this.workout) return 0;
    
    // Recorremos todos los ejercicios
    return this.workout.exercises.reduce((total, ex) => {
      
      // En cada ejercicio, sumamos los sets COMPLETADOS
      const exerciseVol = ex.sets.reduce((setAcc, s) => {
        // Solo cuenta si está completado y tiene valores válidos
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

  // --- ACCIONES ---

  resumeWorkout() {
    this.router.navigate(['/tracker']);
  }

  saveWorkout() {
    // Guardamos el volumen calculado en el objeto final antes de enviar
    if (this.workout) {
      this.workout.volume = this.totalVolume;
    }

    console.log('Guardando entrenamiento final...', { 
      ...this.workout, 
      description: this.workoutDescription,
      endTime: new Date()
    });
    
    this.workoutService.stopWorkout(); 
    
    alert(`¡Entrenamiento guardado!\nVolumen Total: ${this.totalVolume} kg`);
    this.router.navigate(['/dashboard']);
  }

  discardWorkout() {
    if (confirm('¿Estás SEGURO de descartar? Se perderá todo el progreso de hoy.')) {
      this.workoutService.stopWorkout();
      this.router.navigate(['/dashboard']);
    }
  }

  addPhoto() {
    alert('Funcionalidad de cámara/galería (Próximamente)');
  }
}