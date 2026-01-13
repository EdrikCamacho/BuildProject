import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Routine, RoutineExercise } from '../models/routine.model';
import { Exercise } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  private routinesSubject = new BehaviorSubject<Routine[]>([]);
  public routines$ = this.routinesSubject.asObservable();

  // Variable para manejar el borrador temporal (Creación/Edición)
  public draftRoutine: Routine | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadRoutines();
  }

  getRoutines(): Routine[] {
    return this.routinesSubject.value;
  }

  getRoutineById(id: string): Routine | undefined {
    return this.routinesSubject.value.find(r => r.id === id);
  }

  // --- GESTIÓN DE BORRADOR (DRAFT) ---
  
  // Inicializa un borrador (nuevo o existente para editar)
  initDraft(id?: string) {
    if (id) {
      // Editar existente
      const existing = this.getRoutineById(id);
      if (existing) {
        // Clonamos para no modificar el original hasta guardar
        this.draftRoutine = JSON.parse(JSON.stringify(existing));
      }
    } else {
      // Crear nuevo
      this.draftRoutine = {
        id: Date.now().toString(),
        name: 'Nueva Rutina',
        exercises: [],
        createdAt: new Date()
      };
    }
  }

  // Guarda el borrador actual en la lista definitiva
  saveDraft() {
    if (!this.draftRoutine) return;

    const currentRoutines = this.getRoutines();
    const index = currentRoutines.findIndex(r => r.id === this.draftRoutine!.id);

    let updatedRoutines;
    if (index >= 0) {
      // Actualizar existente
      updatedRoutines = [...currentRoutines];
      updatedRoutines[index] = this.draftRoutine;
    } else {
      // Añadir nuevo
      updatedRoutines = [...currentRoutines, this.draftRoutine];
    }

    this.routinesSubject.next(updatedRoutines);
    this.saveToStorage(updatedRoutines);
    this.draftRoutine = null; // Limpiar borrador
  }

  // Añade ejercicios seleccionados al borrador
  addExercisesToDraft(exercises: Exercise[]) {
    if (!this.draftRoutine) this.initDraft();

    const newExercises: RoutineExercise[] = exercises.map(ex => ({
      exercise: ex,
      sets: [{ type: 'normal', reps: 10, weight: 0 }], // Set por defecto
      notes: ''
    }));

    this.draftRoutine!.exercises = [...this.draftRoutine!.exercises, ...newExercises];
  }

  // --- MÉTODOS CRUD DIRECTOS ---

  createRoutine(name: string, exercises: any[]) {
    const newRoutine: Routine = {
      id: Date.now().toString(),
      name,
      exercises,
      createdAt: new Date()
    };
    
    const updated = [...this.getRoutines(), newRoutine];
    this.routinesSubject.next(updated);
    this.saveToStorage(updated);
  }

  deleteRoutine(id: string) {
    const updated = this.getRoutines().filter(r => r.id !== id);
    this.routinesSubject.next(updated);
    this.saveToStorage(updated);
  }

  renameRoutine(id: string, newName: string) {
    const current = this.getRoutines();
    const routine = current.find(r => r.id === id);
    if (routine) {
        routine.name = newName;
        this.routinesSubject.next([...current]);
        this.saveToStorage(current);
    }
  }

  // --- PERSISTENCIA SEGURA (SSR) ---

  private saveToStorage(routines: Routine[]) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('my_routines', JSON.stringify(routines));
    }
  }

  private loadRoutines() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('my_routines');
      if (saved) {
        try {
          this.routinesSubject.next(JSON.parse(saved));
        } catch (e) {
          console.error('Error cargando rutinas', e);
        }
      }
    }
  }
}