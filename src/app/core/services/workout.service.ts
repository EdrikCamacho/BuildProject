import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ActiveWorkout, WorkoutExercise } from '../models/workout.model';
import { Exercise } from '../models/exercise.model';
import { Routine } from '../models/routine.model'; // IMPORTAR ROUTINE

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  // ... (variables anteriores igual) ...
  activeWorkout: ActiveWorkout | null = null;
  private workoutTimerInterval: any;
  restTimerInterval: any;
  isResting = false;
  restDurationRemaining = 0;
  defaultRestSeconds = 90;
  private timerSound = new Audio('assets/sounds/timer-beep.mp3');
  timerTick$ = new Subject<void>();

  constructor() {
    this.loadFromStorage();
  }

  // ... (métodos privados load/save storage igual) ...
  private saveToStorage() {
    if (this.activeWorkout) localStorage.setItem('active_workout', JSON.stringify(this.activeWorkout));
    else localStorage.removeItem('active_workout');
  }
  private loadFromStorage() {
    const saved = localStorage.getItem('active_workout');
    if (saved) {
      this.activeWorkout = JSON.parse(saved);
      if (this.activeWorkout) {
        this.activeWorkout.startTime = new Date(this.activeWorkout.startTime);
        this.startWorkoutTimer(); 
      }
    }
  }

  // MODIFICADO: Acepta una Rutina opcional
  startNewWorkout(routine?: Routine) {
    this.stopRestTimer();
    
    // Si hay rutina, convertimos sus ejercicios a formato de entrenamiento
    let exercises: WorkoutExercise[] = [];
    let name = 'Entrenamiento Libre';

    if (routine) {
      name = routine.name;
      exercises = routine.exercises.map(rex => ({
        tempId: Date.now().toString() + Math.random(),
        exercise: rex.exercise,
        sets: rex.sets.map((s, i) => ({
           id: i + 1,
           type: s.type,
           weight: s.weight || null,
           reps: s.reps || null,
           completed: false
        })),
        notes: rex.notes
      }));
    }

    this.activeWorkout = {
      name,
      startTime: new Date(),
      durationSeconds: 0,
      exercises,
      volume: 0
    };
    this.saveToStorage();
    this.startWorkoutTimer();
  }

  // ... (resto de funciones stopWorkout, addExercise, etc. IGUAL que antes) ...
  stopWorkout() {
    this.activeWorkout = null;
    this.saveToStorage();
    this.stopWorkoutTimer();
    this.stopRestTimer();
  }

  addExercise(exercise: Exercise) {
    if (!this.activeWorkout) return;
    const newGroup: WorkoutExercise = {
      tempId: Date.now().toString(),
      exercise: exercise,
      sets: [{ id: 1, type: 'normal', weight: null, reps: null, completed: false }]
    };
    this.activeWorkout.exercises.push(newGroup);
    this.saveToStorage();
  }

  removeExercise(index: number) {
    if (!this.activeWorkout) return;
    this.activeWorkout.exercises.splice(index, 1);
    this.saveToStorage();
  }

  replaceExercise(index: number, newExercise: Exercise) {
    if (!this.activeWorkout || !this.activeWorkout.exercises[index]) return;
    this.activeWorkout.exercises[index].exercise = newExercise;
    this.saveToStorage();
  }

  updateRestTime(newSeconds: number) {
    this.defaultRestSeconds = newSeconds;
    if (this.isResting) this.restDurationRemaining = newSeconds;
  }

  startRestTimer() {
    this.stopRestTimer();
    this.isResting = true;
    this.restDurationRemaining = this.defaultRestSeconds;
    this.restTimerInterval = setInterval(() => {
      this.restDurationRemaining--;
      this.timerTick$.next();
      if (this.restDurationRemaining <= 0) this.finishRestTimer();
    }, 1000);
  }

  stopRestTimer() {
    if (this.restTimerInterval) clearInterval(this.restTimerInterval);
    this.isResting = false;
    this.restDurationRemaining = 0;
    this.timerTick$.next(); 
  }

  finishRestTimer() {
    this.stopRestTimer();
    this.timerSound.play().catch(e => console.log('Sonido pendiente'));
  }

  addTimeToShow(seconds: number) {
    if (this.isResting) {
      this.restDurationRemaining += seconds;
      this.timerTick$.next();
    }
  }

  private startWorkoutTimer() {
    this.stopWorkoutTimer();
    this.workoutTimerInterval = setInterval(() => {
      if (this.activeWorkout) {
        this.activeWorkout.durationSeconds++;
        this.timerTick$.next();
        if (this.activeWorkout.durationSeconds % 5 === 0) this.saveToStorage();
      }
    }, 1000);
  }

  private stopWorkoutTimer() {
    if (this.workoutTimerInterval) clearInterval(this.workoutTimerInterval);
  }

  formatTime(seconds: number): string {
    if (!seconds || seconds < 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (v: number) => v < 10 ? `0${v}` : v;
    return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
  }
}