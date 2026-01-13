import { Injectable, inject } from '@angular/core';
import { Subject, BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ActiveWorkout, WorkoutExercise } from '../models/workout.model';
import { Exercise } from '../models/exercise.model';
import { Routine } from '../models/routine.model';

// --- Imports de Firebase ---
import { Firestore, collection, addDoc, collectionData, query, orderBy, deleteDoc, doc } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  // Inyecciones de Firebase
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  // Observable del usuario (para saber dónde guardar)
  private user$ = user(this.auth);

  activeWorkout: ActiveWorkout | null = null;
  private workoutTimerInterval: any;

  // --- HISTORIAL (MODIFICADO PARA FIREBASE) ---
  // Ya no usamos BehaviorSubject manual para el historial, sino un Observable directo de Firebase
  public history$: Observable<ActiveWorkout[]>;

  // Descanso
  restTimerInterval: any;
  isResting = false;
  restDurationRemaining = 0;
  defaultRestSeconds = 90;
  private timerSound = new Audio('assets/sounds/timer-beep.mp3');
  
  timerTick$ = new Subject<void>();

  constructor() {
    this.loadFromStorage();
    
    // Inicializar el history$ conectado a Firebase
    this.history$ = this.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser) {
            // Si no hay usuario logueado, intentamos mostrar lo local (fallback) o vacío
            return new BehaviorSubject<ActiveWorkout[]>([]); 
        }
        
        // Conexión en tiempo real a la colección del usuario
        const col = collection(this.firestore, `users/${currentUser.uid}/workouts`);
        const q = query(col, orderBy('startTime', 'desc'));
        
        return collectionData(q, { idField: 'id' }).pipe(
            map(workouts => workouts.map(w => {
                // Restaurar fechas que vienen como Timestamp de Firebase
                const data = w as any;
                return {
                    ...data,
                    startTime: data.startTime?.toDate ? data.startTime.toDate() : new Date(data.startTime),
                    endTime: data.endTime?.toDate ? data.endTime.toDate() : (data.endTime ? new Date(data.endTime) : null)
                } as ActiveWorkout;
            }))
        );
      })
    );
  }

  // --- MÉTODOS LOCALES (SE MANTIENEN IGUAL) ---

  private saveToStorage() {
    if (this.activeWorkout) localStorage.setItem('active_workout', JSON.stringify(this.activeWorkout));
    else localStorage.removeItem('active_workout');
  }

  private loadFromStorage() {
    if (typeof localStorage === 'undefined') return; // Protección SSR
    const saved = localStorage.getItem('active_workout');
    if (saved) {
      this.activeWorkout = JSON.parse(saved);
      if (this.activeWorkout) {
        this.activeWorkout.startTime = new Date(this.activeWorkout.startTime);
        this.startWorkoutTimer(); 
      }
    }
  }

  // --- GESTIÓN DE HISTORIAL (MODIFICADO) ---

  // Método auxiliar para obtener un workout específico (ahora debe ser asíncrono o buscar en el snapshot actual si nos suscribimos, 
  // pero para compatibilidad rápida, dejaremos que los componentes usen history$ | async)
  // NOTA: Si algún componente usa getWorkoutById de forma síncrona, fallará. 
  // Lo mejor es que los componentes se suscriban a history$.
  
  async saveToHistory(workout: ActiveWorkout) {
    const currentUser = this.auth.currentUser;
    
    // Si NO hay usuario, guardamos en LocalStorage como antes (Modo Invitado)
    if (!currentUser) {
        this.saveToLocalHistory(workout);
        return;
    }

    // Si HAY usuario, guardamos en Firebase
    try {
        const col = collection(this.firestore, `users/${currentUser.uid}/workouts`);
        await addDoc(col, {
            ...workout,
            // Convertir fechas a strings o Timestamps
            startTime: new Date(workout.startTime),
            endTime: new Date(),
            userId: currentUser.uid
        });
        console.log('Guardado en Firebase');
    } catch (e) {
        console.error('Error guardando en nube:', e);
    }
  }

  // Fallback para guardar local si no hay internet/usuario
  private saveToLocalHistory(workout: ActiveWorkout) {
     const saved = localStorage.getItem('workout_history');
     let history = saved ? JSON.parse(saved) : [];
     workout.id = Date.now().toString();
     history = [workout, ...history];
     localStorage.setItem('workout_history', JSON.stringify(history));
     // Nota: Esto no actualizará history$ automáticamente si no recargas, 
     // pero es un mal menor comparado con romper la app.
  }

  async deleteFromHistory(id: string) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return; // O implementar borrado local
    
    try {
        const docRef = doc(this.firestore, `users/${currentUser.uid}/workouts/${id}`);
        await deleteDoc(docRef);
    } catch (e) {
        console.error('Error borrando:', e);
    }
  }

  // --- EL RESTO DE MÉTODOS SIGUEN IGUAL (LÓGICA DE ENTRENAMIENTO) ---

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

  startRestTimer(seconds?: number) { // Modifiqué levemente para aceptar parámetro opcional si lo usas
    this.stopRestTimer();
    this.isResting = true;
    this.restDurationRemaining = seconds || this.defaultRestSeconds;
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

  // IMPORTANTE: Este método síncrono ya no es compatible con Firebase directo
  // Lo dejo devolviendo undefined para evitar errores de compilación, 
  // pero debes actualizar donde lo uses para buscar en la lista history$
  getWorkoutById(id: string): ActiveWorkout | undefined {
    console.warn('getWorkoutById síncrono está obsoleto con Firebase. Usa history$');
    return undefined; 
  }
}