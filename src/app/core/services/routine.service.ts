import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  collectionData, 
  query, 
  where, 
  doc, 
  deleteDoc, 
  updateDoc,
  orderBy
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, of, switchMap, tap } from 'rxjs';
import { Routine, RoutineExercise } from '../models/routine.model';
import { Exercise } from '../models/exercise.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  
  private routinesCollection = collection(this.firestore, 'routines');

  private routinesSubject = new BehaviorSubject<Routine[]>([]);
  
  // Observable que se actualiza solo con las rutinas del usuario actual
  public routines$ = this.authService.user$.pipe(
    switchMap(user => {
      if (user) {
        // Filtramos por userId para que nadie vea rutinas de otros
        const q = query(
          this.routinesCollection, 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        return collectionData(q, { idField: 'id' }) as Observable<Routine[]>;
      } else {
        return of([]);
      }
    }),
    tap(routines => this.routinesSubject.next(routines))
  );

  public draftRoutine: Routine | null = null;

  constructor() {}

  getRoutines(): Routine[] {
    return this.routinesSubject.value;
  }

  getRoutineById(id: string): Routine | undefined {
    return this.routinesSubject.value.find(r => r.id === id);
  }

  // --- GESTIÓN DE BORRADOR ---
  
  initDraft(id?: string) {
    if (id) {
      const existing = this.getRoutineById(id);
      if (existing) {
        this.draftRoutine = JSON.parse(JSON.stringify(existing));
      }
    } else {
      this.draftRoutine = {
        name: 'Nueva Rutina',
        exercises: [],
        createdAt: new Date(),
        userId: this.authService.currentUser?.uid
      } as Routine;
    }
  }

  async saveDraft() {
    if (!this.draftRoutine) return;

    const user = this.authService.currentUser;
    if (!user) throw new Error('Usuario no identificado');

    this.draftRoutine.userId = user.uid;

    if (this.draftRoutine.id) {
      const routineDoc = doc(this.firestore, `routines/${this.draftRoutine.id}`);
      const { id, ...data } = this.draftRoutine;
      await updateDoc(routineDoc, { ...data });
    } else {
      await addDoc(this.routinesCollection, this.draftRoutine);
    }

    this.draftRoutine = null;
  }

  addExercisesToDraft(exercises: Exercise[]) {
    if (!this.draftRoutine) this.initDraft();

    const newExercises: RoutineExercise[] = exercises.map(ex => ({
      exercise: ex,
      sets: [{ type: 'normal', reps: 10, weight: 0 }],
      notes: ''
    }));

    this.draftRoutine!.exercises = [...this.draftRoutine!.exercises, ...newExercises];
  }

  // --- MÉTODOS CRUD ---

  async deleteRoutine(id: string) {
    const routineDoc = doc(this.firestore, `routines/${id}`);
    await deleteDoc(routineDoc);
  }

  async renameRoutine(id: string, newName: string) {
    const routineDoc = doc(this.firestore, `routines/${id}`);
    await updateDoc(routineDoc, { name: newName });
  }

  // --- CREACIÓN DE RUTINAS POR DEFECTO ---

  async createDefaultRoutines(userId: string) {
    const defaultRoutines = [
      {
        name: 'Día de Upper (Torso)',
        description: 'Rutina de hipertrofia para tren superior: Pecho, Espalda y Hombros.',
        userId: userId,
        createdAt: new Date(),
        exercises: [
          {
            exercise: { id: '1', name: 'Press de Banca', muscleGroup: 'Pecho', category: 'Fuerza' }, // Ajustar según tu ExerciseService
            sets: [
              { type: 'normal', reps: 10, weight: 0 },
              { type: 'normal', reps: 10, weight: 0 },
              { type: 'normal', reps: 10, weight: 0 }
            ],
            notes: 'Controlar el tempo 2-0-2.'
          },
          {
            exercise: { id: '3', name: 'Remo con Barra', muscleGroup: 'Espalda', category: 'Fuerza' },
            sets: [
              { type: 'normal', reps: 12, weight: 0 },
              { type: 'normal', reps: 12, weight: 0 },
              { type: 'normal', reps: 12, weight: 0 }
            ],
            notes: 'Mantener la espalda recta.'
          },
          {
            exercise: { id: '4', name: 'Press Militar', muscleGroup: 'Hombro', category: 'Fuerza' },
            sets: [
              { type: 'normal', reps: 10, weight: 0 },
              { type: 'normal', reps: 10, weight: 0 }
            ]
          }
        ]
      },
      {
        name: 'Día de Lower (Pierna)',
        description: 'Rutina de hipertrofia para tren inferior: Cuádriceps, Isquios y Glúteos.',
        userId: userId,
        createdAt: new Date(),
        exercises: [
          {
            exercise: { id: '2', name: 'Sentadilla Libre', muscleGroup: 'Pierna', category: 'Fuerza' },
            sets: [
              { type: 'normal', reps: 8, weight: 0 },
              { type: 'normal', reps: 8, weight: 0 },
              { type: 'normal', reps: 8, weight: 0 }
            ],
            notes: 'Profundidad adecuada.'
          },
          {
            exercise: { id: '5', name: 'Peso Muerto Rumano', muscleGroup: 'Pierna', category: 'Fuerza' },
            sets: [
              { type: 'normal', reps: 12, weight: 0 },
              { type: 'normal', reps: 12, weight: 0 },
              { type: 'normal', reps: 12, weight: 0 }
            ],
            notes: 'Sentir el estiramiento en isquios.'
          },
          {
            exercise: { id: '6', name: 'Prensa de Piernas', muscleGroup: 'Pierna', category: 'Fuerza' },
            sets: [
              { type: 'normal', reps: 15, weight: 0 },
              { type: 'normal', reps: 15, weight: 0 }
            ]
          }
        ]
      }
    ];

    // Guardamos cada rutina en la colección de Firestore vinculada al usuario
    for (const routine of defaultRoutines) {
      try {
        await addDoc(this.routinesCollection, routine);
      } catch (error) {
        console.error("Error al crear rutina por defecto:", error);
      }
    }
  }
}