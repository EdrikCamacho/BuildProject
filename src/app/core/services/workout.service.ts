import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ActiveWorkout, WorkoutExercise } from '../models/workout.model';
import { Exercise } from '../models/exercise.model';
import { Routine } from '../models/routine.model';

// Firebase
import { Firestore, collection, addDoc, collectionData, query, orderBy, deleteDoc, doc } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  
  // Observable de usuario para gestionar el historial por cuenta
  private user$ = user(this.auth);

  activeWorkout: ActiveWorkout | null = null;
  private workoutTimerInterval: any;

  // --- HISTORIAL (Conectado a Firebase) ---
  public history$: Observable<ActiveWorkout[]>;

  // Descanso
  restTimerInterval: any;
  isResting = false;
  restDurationRemaining = 0;
  defaultRestSeconds = 90;
  
  // Audio: Lo inicializamos como null para que no falle en el servidor
  private timerSound: HTMLAudioElement | null = null;
  
  timerTick$ = new Subject<void>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // 1. CORRECCIÓN AUDIO: Solo crear el Audio si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.timerSound = new Audio('assets/sounds/timer-beep.mp3');
    }

    this.loadFromStorage();
    
    // 2. CORRECCIÓN HISTORIAL: Si no hay usuario, devuelve array vacío para no romper la UI
    this.history$ = this.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser) return of([]); 

        const col = collection(this.firestore, `users/${currentUser.uid}/workouts`);
        const q = query(col, orderBy('startTime', 'desc'));
        
        return collectionData(q, { idField: 'id' }).pipe(
            map(workouts => workouts.map(w => {
                const data = w as any;
                return {
                    ...data,
                    // Convertir Timestamps de Firebase a Date
                    startTime: data.startTime?.toDate ? data.startTime.toDate() : new Date(data.startTime),
                    endTime: data.endTime?.toDate ? data.endTime.toDate() : (data.endTime ? new Date(data.endTime) : null)
                } as ActiveWorkout;
            }))
        );
      })
    );
  }

  // --- MÉTODOS LOCALES ---

  private saveToStorage() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.activeWorkout) localStorage.setItem('active_workout', JSON.stringify(this.activeWorkout));
      else localStorage.removeItem('active_workout');
    }
  }

  private loadFromStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('active_workout');
      if (saved) {
        this.activeWorkout = JSON.parse(saved);
        if (this.activeWorkout) {
          this.activeWorkout.startTime = new Date(this.activeWorkout.startTime);
          this.startWorkoutTimer(); 
        }
      }
    }
  }

  // --- GESTIÓN DE HISTORIAL (GUARDAR EN FIREBASE) ---
  
  async saveToHistory(workout: ActiveWorkout) {
    const currentUser = this.auth.currentUser;
    
    if (!currentUser) {
        console.warn('Usuario no identificado, no se puede guardar en la nube.');
        alert('Debes iniciar sesión para guardar tu progreso.');
        return;
    }

    try {
        const col = collection(this.firestore, `users/${currentUser.uid}/workouts`);
        
        // Limpiamos el objeto antes de enviarlo a Firebase
        // Firebase no acepta objetos personalizados complejos o indefinidos a veces
        const workoutData = {
            name: workout.name || 'Entrenamiento',
            startTime: new Date(workout.startTime), // Aseguramos fecha
            endTime: new Date(),
            durationSeconds: workout.durationSeconds,
            volume: workout.volume || 0,
            userId: currentUser.uid,
            // Mapeamos los ejercicios para guardar solo datos puros (sin funciones ni clases)
            exercises: workout.exercises.map(ex => ({
                exercise: { ...ex.exercise }, // Copia del ejercicio
                sets: ex.sets.map(s => ({ ...s })), // Copia de los sets
                notes: ex.notes || ''
            }))
        };

        await addDoc(col, workoutData);
        console.log('✅ Entrenamiento guardado en Firebase');
        
        // IMPORTANTE: Detenemos el workout local SOLO después de guardar exitosamente
        this.stopWorkout(); 

    } catch (e) {
        console.error('❌ Error guardando en nube:', e);
        alert('Hubo un error al guardar el entrenamiento. Revisa tu conexión.');
    }
  }

  async deleteFromHistory(id: string) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return;
    
    try {
        const docRef = doc(this.firestore, `users/${currentUser.uid}/workouts/${id}`);
        await deleteDoc(docRef);
    } catch (e) {
        console.error('Error borrando:', e);
    }
  }

  // --- LÓGICA DE ENTRENAMIENTO (TIMERS, ETC) ---

  startNewWorkout(routine?: Routine) {
    this.stopRestTimer();
    let exercises: WorkoutExercise[] = [];
    let name = 'Entrenamiento Libre';

    if (routine) {
      name = routine.name;
      exercises = routine.exercises.map(rex => ({
        tempId: Date.now().toString() + Math.random(),
        exercise: rex.exercise,
        sets: rex.sets.map((s, i) => ({
           id: i + 1, type: s.type, weight: s.weight || null, reps: s.reps || null, completed: false
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

  stopWorkout() {
    this.activeWorkout = null;
    this.saveToStorage();
    this.stopWorkoutTimer();
    this.stopRestTimer();
  }

  // ... (addExercise, removeExercise, replaceExercise siguen igual) ...
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

  // ... (Lógica de Timers con chequeo de audio) ...

  updateRestTime(newSeconds: number) {
    this.defaultRestSeconds = newSeconds;
    if (this.isResting) this.restDurationRemaining = newSeconds;
  }

  startRestTimer(seconds?: number) {
    this.stopRestTimer();
    this.isResting = true;
    this.restDurationRemaining = seconds || this.defaultRestSeconds;
    
    // Timer en intervalo
    if (isPlatformBrowser(this.platformId)) {
        this.restTimerInterval = setInterval(() => {
        this.restDurationRemaining--;
        this.timerTick$.next();
        if (this.restDurationRemaining <= 0) this.finishRestTimer();
        }, 1000);
    }
  }

  stopRestTimer() {
    if (this.restTimerInterval) clearInterval(this.restTimerInterval);
    this.isResting = false;
    this.restDurationRemaining = 0;
    this.timerTick$.next(); 
  }

  finishRestTimer() {
    this.stopRestTimer();
    // CORRECCIÓN AUDIO: Verificamos si existe antes de reproducir
    if (this.timerSound) {
        this.timerSound.play().catch(e => console.log('Sonido bloqueado por navegador', e));
    }
  }

  addTimeToShow(seconds: number) {
    if (this.isResting) {
      this.restDurationRemaining += seconds;
      this.timerTick$.next();
    }
  }

  private startWorkoutTimer() {
    this.stopWorkoutTimer();
    if (isPlatformBrowser(this.platformId)) {
        this.workoutTimerInterval = setInterval(() => {
        if (this.activeWorkout) {
            this.activeWorkout.durationSeconds++;
            this.timerTick$.next();
            if (this.activeWorkout.durationSeconds % 5 === 0) this.saveToStorage();
        }
        }, 1000);
    }
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

  getWorkoutById(id: string): ActiveWorkout | undefined {
    // Método legacy para componentes que no usan el observable history$
    // Retorna undefined porque en Firebase es asíncrono
    return undefined; 
  }
}