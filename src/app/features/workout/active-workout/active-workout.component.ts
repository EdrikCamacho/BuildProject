import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../../core/services/workout.service';
import { ActiveWorkout, WorkoutSet } from '../../../core/models/workout.model';

@Component({
  selector: 'app-active-workout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './active-workout.component.html'
})
export class ActiveWorkoutComponent implements OnInit {
  
  // Getter para acceder al workout del servicio
  get workout(): ActiveWorkout | null {
    return this.workoutService.activeWorkout;
  }

  // Getter para el tiempo formateado
  get timerDisplay(): string {
    return this.workoutService.formatTime(this.workout?.durationSeconds || 0);
  }

  constructor(private router: Router, private workoutService: WorkoutService) {}

  ngOnInit() {
    // Si entran directo a /tracker sin iniciar sesión, redirigir
    if (!this.workoutService.activeWorkout) {
      this.router.navigate(['/dashboard']);
    }
  }

  // --- NAVEGACIÓN A BIBLIOTECA ---
  addExercise() {
    // Vamos a la lista de ejercicios indicando que queremos SELECCIONAR
    this.router.navigate(['/exercises'], { queryParams: { mode: 'selection' } });
  }

  // --- MÉTODOS DE EDICIÓN ---
  addSet(exerciseIndex: number) {
    if (!this.workout) return;
    const sets = this.workout.exercises[exerciseIndex].sets;
    const lastSet = sets[sets.length - 1];
    
    sets.push({
      id: sets.length + 1,
      type: 'normal',
      weight: lastSet ? lastSet.weight : null,
      reps: lastSet ? lastSet.reps : null,
      completed: false
    });
  }

  removeSet(exerciseIndex: number, setIndex: number) {
    if (!this.workout) return;
    this.workout.exercises[exerciseIndex].sets.splice(setIndex, 1);
  }

  toggleSetCompletion(set: WorkoutSet) {
    set.completed = !set.completed;
  }

  finishWorkout() {
    if(confirm('¿Terminar entrenamiento?')) {
      this.workoutService.stopWorkout();
      this.router.navigate(['/dashboard']);
    }
  }

  cancelWorkout() {
    if(confirm('¿Descartar entrenamiento?')) {
      this.workoutService.stopWorkout();
      this.router.navigate(['/dashboard']);
    }
  }
}