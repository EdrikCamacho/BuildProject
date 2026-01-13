import { Injectable, inject, PLATFORM_ID, Inject, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, Observable, of, from } from 'rxjs';
import { map, switchMap, tap, shareReplay, catchError } from 'rxjs/operators';
import { ActiveWorkout, WorkoutExercise } from '../models/workout.model';
import { Exercise } from '../models/exercise.model';
import { Routine } from '../models/routine.model';

// Firebase
import { Firestore, collection, addDoc, query, deleteDoc, doc, getDocs } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private ngZone = inject(NgZone);
  
  private user$ = authState(this.auth);

  activeWorkout: ActiveWorkout | null = null;
  private workoutTimerInterval: any;

  // --- HISTORIAL ---
  public history$: Observable<ActiveWorkout[]>;

  // Descanso y Audio
  restTimerInterval: any;
  isResting = false;
  restDurationRemaining = 0;
  defaultRestSeconds = 90;
  private timerSound: HTMLAudioElement | null = null;
  timerTick$ = new Subject<void>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.timerSound = new Audio('assets/sounds/timer-beep.mp3');
    }

    this.loadFromStorage();
    
    this.history$ = this.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser || !isPlatformBrowser(this.platformId)) {
          return of([]);
        } 

        const colRef = collection(this.firestore, `users/${currentUser.uid}/workouts`);
        
        return from(getDocs(colRef)).pipe(
          map(querySnapshot => {
            const workouts: ActiveWorkout[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data() as any;
              workouts.push({
                ...data,
                id: doc.id,
                startTime: data.startTime?.seconds ? new Date(data.startTime.seconds * 1000) : new Date(data.startTime),
                endTime: data.endTime?.seconds ? new Date(data.endTime.seconds * 1000) : (data.endTime ? new Date(data.endTime) : null)
              } as ActiveWorkout);
            });
            return workouts.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
          }),
          catchError(() => of([])),
          shareReplay(1)
        );
      })
    );
  }

  // --- REPETIR RUTINA ---
  startFromPrevious(previousWorkout: ActiveWorkout) {
    this.stopRestTimer();
    this.stopWorkoutTimer();

    const exercises: WorkoutExercise[] = previousWorkout.exercises.map(ex => ({
      tempId: Date.now().toString() + Math.random(),
      exercise: { ...ex.exercise },
      sets: ex.sets.map((s, i) => ({
        id: i + 1,
        type: s.type,
        weight: s.weight,
        reps: s.reps,
        completed: false 
      })),
      notes: ex.notes || ''
    }));

    this.activeWorkout = {
      name: previousWorkout.name,
      startTime: new Date(),
      durationSeconds: 0,
      exercises,
      volume: 0
    };

    this.saveToStorage();
    this.startWorkoutTimer();
  }

  // --- GESTIÓN DE TIEMPO DE DESCANSO ---
  updateRestTime(newSeconds: number) {
    this.defaultRestSeconds = newSeconds;
    if (this.isResting) {
      this.restDurationRemaining = newSeconds;
    }
  }

  // --- MÉTODOS DE PERSISTENCIA ---
  private saveToStorage() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.activeWorkout) {
        localStorage.setItem('active_workout', JSON.stringify(this.activeWorkout));
      } else {
        localStorage.removeItem('active_workout');
      }
    }
  }

  private loadFromStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('active_workout');
      if (saved) {
        try {
          this.activeWorkout = JSON.parse(saved);
          if (this.activeWorkout) {
            this.activeWorkout.startTime = new Date(this.activeWorkout.startTime);
            this.startWorkoutTimer(); 
          }
        } catch (e) {
          localStorage.removeItem('active_workout');
        }
      }
    }
  }

  // --- LÓGICA DE CRONÓMETROS (ZONA FUERA DE ANGULAR PARA ESTABILIDAD) ---
  private startWorkoutTimer() {
    this.stopWorkoutTimer();
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        this.workoutTimerInterval = setInterval(() => {
          if (this.activeWorkout) {
            this.activeWorkout.durationSeconds++;
            this.ngZone.run(() => {
              this.timerTick$.next();
              if (this.activeWorkout!.durationSeconds % 5 === 0) {
                this.saveToStorage();
              }
            });
          }
        }, 1000);
      });
    }
  }

  private stopWorkoutTimer() {
    if (this.workoutTimerInterval) {
      clearInterval(this.workoutTimerInterval);
    }
  }

  startRestTimer(seconds?: number) {
    this.stopRestTimer();
    this.isResting = true;
    this.restDurationRemaining = seconds || this.defaultRestSeconds;
    
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        this.restTimerInterval = setInterval(() => {
          this.restDurationRemaining--;
          this.ngZone.run(() => {
            this.timerTick$.next();
            if (this.restDurationRemaining <= 0) {
              this.finishRestTimer();
            }
          });
        }, 1000);
      });
    }
  }

  stopRestTimer() {
    if (this.restTimerInterval) clearInterval(this.restTimerInterval);
    this.isResting = false;
    this.restDurationRemaining = 0;
  }

  finishRestTimer() {
    this.stopRestTimer();
    if (this.timerSound) {
      this.timerSound.play().catch(() => {});
    }
  }

  addTimeToShow(seconds: number) {
    if (this.isResting) {
      this.restDurationRemaining += seconds;
      this.timerTick$.next();
    }
  }

  // --- FIREBASE Y OPERACIONES ---
  async saveToHistory(workout: ActiveWorkout) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return;
    try {
        const col = collection(this.firestore, `users/${currentUser.uid}/workouts`);
        const workoutData = {
            name: workout.name || 'Entrenamiento',
            startTime: new Date(workout.startTime),
            endTime: new Date(),
            durationSeconds: workout.durationSeconds,
            volume: workout.volume || 0,
            userId: currentUser.uid,
            exercises: workout.exercises.map(ex => ({
                exercise: { ...ex.exercise },
                sets: ex.sets.map(s => ({ ...s })),
                notes: ex.notes || ''
            }))
        };
        await addDoc(col, workoutData);
        this.stopWorkout(); 
        this.timerTick$.next();
    } catch (e) { console.error(e); }
  }

  async deleteFromHistory(id: string) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return;
    try {
        await deleteDoc(doc(this.firestore, `users/${currentUser.uid}/workouts/${id}`));
    } catch (e) { console.error(e); }
  }

  startNewWorkout(routine?: Routine) {
    this.stopRestTimer();
    let exercises: WorkoutExercise[] = [];
    if (routine) {
      exercises = routine.exercises.map(rex => ({
        tempId: Date.now().toString() + Math.random(),
        exercise: rex.exercise,
        sets: rex.sets.map((s, i) => ({ id: i + 1, type: s.type, weight: s.weight || null, reps: s.reps || null, completed: false })),
        notes: rex.notes
      }));
    }
    this.activeWorkout = { name: routine?.name || 'Entrenamiento Libre', startTime: new Date(), durationSeconds: 0, exercises, volume: 0 };
    this.saveToStorage();
    this.startWorkoutTimer();
  }

  stopWorkout() {
    this.activeWorkout = null;
    this.saveToStorage();
    this.stopWorkoutTimer();
    this.stopRestTimer();
  }

  addExercise(exercise: Exercise) {
    if (!this.activeWorkout) return;
    this.activeWorkout.exercises.push({ tempId: Date.now().toString(), exercise, sets: [{ id: 1, type: 'normal', weight: null, reps: null, completed: false }] });
    this.saveToStorage();
  }

  removeExercise(index: number) {
    if (this.activeWorkout) { 
      this.activeWorkout.exercises.splice(index, 1); 
      this.saveToStorage(); 
    }
  }

  replaceExercise(index: number, newExercise: Exercise) {
    if (this.activeWorkout?.exercises[index]) { 
      this.activeWorkout.exercises[index].exercise = newExercise; 
      this.saveToStorage(); 
    }
  }

  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (v: number) => v < 10 ? `0${v}` : v;
    return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
  }

  getWorkoutById(id: string) { return undefined; }
}