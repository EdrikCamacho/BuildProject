import { Injectable } from '@angular/core';
import { ActiveWorkout, WorkoutExercise } from '../models/workout.model';
import { Exercise } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  // El entrenamiento actual (null si no hay ninguno activo)
  activeWorkout: ActiveWorkout | null = null;
  
  // Para el cronómetro
  private timerInterval: any;

  constructor() {}

  // Iniciar una nueva sesión (llamado desde Dashboard)
  startNewWorkout(name: string = 'Entrenamiento Libre') {
    this.activeWorkout = {
      name,
      startTime: new Date(),
      durationSeconds: 0,
      exercises: [],
      volume: 0
    };
    this.startTimer();
  }

  // Añadir ejercicio desde la Biblioteca
  addExercise(exercise: Exercise) {
    if (!this.activeWorkout) return;

    const newGroup: WorkoutExercise = {
      tempId: Date.now().toString(), // ID único temporal
      exercise: exercise,
      sets: [
        { id: 1, type: 'normal', weight: null, reps: null, completed: false }
      ]
    };
    
    this.activeWorkout.exercises.push(newGroup);
  }

  // Cancelar/Terminar
  stopWorkout() {
    this.activeWorkout = null;
    this.stopTimer();
  }

  // Lógica del Timer (Centralizada)
  private startTimer() {
    this.stopTimer(); // Limpiar por si acaso
    this.timerInterval = setInterval(() => {
      if (this.activeWorkout) {
        this.activeWorkout.durationSeconds++;
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  // Helper para formato de tiempo (usado en componentes)
  formatTime(seconds: number): string {
    if (!seconds) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (v: number) => v < 10 ? `0${v}` : v;
    return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
  }
}