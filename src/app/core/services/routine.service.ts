import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Routine } from '../models/routine.model';
import { Exercise } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  private routines: Routine[] = [];
  
  // Observable para que el Dashboard se actualice solo
  routines$ = new BehaviorSubject<Routine[]>([]);

  // Borrador temporal (para cuando vas y vienes de la biblioteca)
  draftRoutine: Routine | null = null;

  constructor() {
    this.loadRoutines();
  }

  private loadRoutines() {
    const saved = localStorage.getItem('my_routines');
    if (saved) {
      this.routines = JSON.parse(saved);
    } else {
      // Datos de prueba iniciales
      this.routines = [
        { id: '1', name: 'Push Day - Fuerza', exercises: [], lastPerformed: 'Nunca' }
      ];
    }
    this.routines$.next(this.routines);
  }

  private saveToStorage() {
    localStorage.setItem('my_routines', JSON.stringify(this.routines));
    this.routines$.next(this.routines);
  }

  // --- GESTIÓN DE BORRADOR (CREAR/EDITAR) ---
  initDraft(id?: string) {
    if (id) {
      // Modo Edición: Copiar rutina existente
      const existing = this.routines.find(r => r.id === id);
      if (existing) {
        this.draftRoutine = JSON.parse(JSON.stringify(existing));
      }
    } else {
      // Modo Crear: Rutina vacía
      this.draftRoutine = {
        id: Date.now().toString(),
        name: '',
        exercises: []
      };
    }
  }

  addExercisesToDraft(exercises: Exercise[]) {
    if (!this.draftRoutine) this.initDraft();
    
    exercises.forEach(ex => {
      this.draftRoutine!.exercises.push({
        exercise: ex,
        sets: [
            { type: 'normal', reps: 10 },
            { type: 'normal', reps: 10 },
            { type: 'normal', reps: 10 }
        ] // 3 series por defecto
      });
    });
  }

  saveDraft() {
    if (!this.draftRoutine) return;
    
    const index = this.routines.findIndex(r => r.id === this.draftRoutine!.id);
    if (index >= 0) {
      this.routines[index] = this.draftRoutine; // Actualizar
    } else {
      this.routines.push(this.draftRoutine); // Crear nueva
    }
    this.saveToStorage();
    this.draftRoutine = null;
  }

  // --- ACCIONES CRUD ---
  deleteRoutine(id: string) {
    this.routines = this.routines.filter(r => r.id !== id);
    this.saveToStorage();
  }

  renameRoutine(id: string, newName: string) {
    const routine = this.routines.find(r => r.id === id);
    if (routine) {
      routine.name = newName;
      this.saveToStorage();
    }
  }
}