import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
// Importamos todo estrictamente de @angular/fire/firestore
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
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { Routine, RoutineExercise } from '../models/routine.model';
import { Exercise } from '../models/exercise.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private injector = inject(Injector); // Necesario para mantener el contexto de Firebase
  
  private routinesSubject = new BehaviorSubject<Routine[]>([]);
  
  // Observable principal para el Dashboard
  public routines$ = this.authService.user$.pipe(
    switchMap(user => {
      if (user) {
        console.log('Buscando rutinas para el UID:', user.uid);
        
        // --- SOLUCIÓN AL ERROR DE SDK Y CONTEXTO ---
        // runInInjectionContext asegura que Firebase reconozca la instancia de la DB
        return runInInjectionContext(this.injector, () => {
          const colRef = collection(this.firestore, 'routines');
          
          const q = query(
            colRef, 
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          
          return (collectionData(q, { idField: 'id' }) as Observable<Routine[]>).pipe(
            catchError(err => {
              console.error("ERROR DE FIREBASE AL CARGAR:", err);
              return of([]);
            })
          );
        });
      } else {
        return of([]);
      }
    }),
    tap(routines => {
      console.log('Rutinas sincronizadas con éxito:', routines);
      this.routinesSubject.next(routines);
    })
  );

  public draftRoutine: Routine | null = null;

  constructor() {}

  // --- MÉTODOS DE ACCESO ---
  getRoutines(): Routine[] {
    return this.routinesSubject.value;
  }

  getRoutineById(id: string): Routine | undefined {
    return this.routinesSubject.value.find(r => r.id === id);
  }

  // --- GESTIÓN DE BORRADOR (DRAFT) ---
  
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

  addExercisesToDraft(exercises: Exercise[]) {
    if (!this.draftRoutine) this.initDraft();

    const newExercises: RoutineExercise[] = exercises.map(ex => ({
      exercise: ex,
      sets: [{ type: 'normal', reps: 10, weight: 0 }],
      notes: ''
    }));

    this.draftRoutine!.exercises = [...this.draftRoutine!.exercises, ...newExercises];
  }

  async saveDraft() {
    if (!this.draftRoutine) return;

    const user = this.authService.currentUser;
    if (!user) throw new Error('Usuario no identificado');

    this.draftRoutine.userId = user.uid;
    const colRef = collection(this.firestore, 'routines');

    if (this.draftRoutine.id) {
      const routineDoc = doc(this.firestore, `routines/${this.draftRoutine.id}`);
      const { id, ...data } = this.draftRoutine;
      await updateDoc(routineDoc, { ...data });
    } else {
      await addDoc(colRef, this.draftRoutine);
    }

    this.draftRoutine = null;
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

  // --- CREACIÓN DE RUTINAS POR DEFECTO (HIPERTROFIA) ---

  async createDefaultRoutines(userId: string) {
    const colRef = collection(this.firestore, 'routines');
    const defaultRoutines = [
      {
        name: 'Día de Upper (Torso)',
        description: 'Rutina de hipertrofia para tren superior: Pecho, Espalda y Hombros.',
        userId: userId,
        createdAt: new Date(),
        exercises: [
          {
            exercise: { id: '1', name: 'Press de Banca', muscleGroup: 'Pecho', category: 'Fuerza' },
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

    for (const routine of defaultRoutines) {
      try {
        await addDoc(colRef, routine);
      } catch (error) {
        console.error("Error al crear rutina por defecto:", error);
      }
    }
    console.log('Rutinas iniciales creadas con éxito para el usuario.');
  }
}