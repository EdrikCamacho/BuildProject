import { Component, OnInit } from '@angular/core';
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
  
  // Controla qué menú desplegable está abierto (índice del ejercicio)
  activeMenuIndex: number | null = null;

  // Getters para conectar con el servicio
  get workout(): ActiveWorkout | null { return this.workoutService.activeWorkout; }
  get timerDisplay(): string { return this.workoutService.formatTime(this.workout?.durationSeconds || 0); }
  
  // Getters del Descanso
  get isResting(): boolean { return this.workoutService.isResting; }
  get restTimerDisplay(): string { return this.workoutService.formatTime(this.workoutService.restDurationRemaining); }

  constructor(private router: Router, public workoutService: WorkoutService) {}

  ngOnInit() {
    // Si no hay workout activo, volver al dashboard
    if (!this.workoutService.activeWorkout) {
      this.router.navigate(['/dashboard']);
    }
  }

  // --- MENÚ DE OPCIONES ---
  toggleMenu(index: number, event: Event) {
    event.stopPropagation(); // Evita conflictos de click
    this.activeMenuIndex = this.activeMenuIndex === index ? null : index;
  }

  closeMenu() {
    this.activeMenuIndex = null;
  }

  // --- ACCIONES DEL MENÚ ---
  viewInstructions(exerciseId: string) {
    // Vamos al detalle y le decimos que vuelva al tracker
    this.router.navigate(['/exercises', exerciseId], { queryParams: { returnTo: 'selection' } }); // Reusamos la lógica de retorno
  }

  startReplacing(index: number) {
    // Vamos a la biblioteca en modo 'replace'
    this.router.navigate(['/exercises'], { queryParams: { mode: 'replace', replaceIndex: index } });
  }

  removeExerciseUi(index: number) {
    if (confirm('¿Eliminar este ejercicio de la rutina?')) {
      this.workoutService.removeExercise(index);
      this.closeMenu();
    }
  }

  // --- GESTIÓN DE SETS ---
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
    if (set.completed) {
      // Iniciar descanso automático al completar
      this.workoutService.startRestTimer();
    }
  }

  // --- CONTROLES TEMPORIZADOR ---
  skipRest() { this.workoutService.stopRestTimer(); }
  addRestTime(seconds: number) { this.workoutService.addTimeToShow(seconds); }

  // --- NAVEGACIÓN ---
  addExercise() {
    this.router.navigate(['/exercises'], { queryParams: { mode: 'selection' } });
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