import { Exercise } from './exercise.model';

export interface RoutineSet {
  type: 'warmup' | 'normal' | 'failure' | 'drop';
  reps?: number;
  weight?: number; 
}

export interface RoutineExercise {
  exercise: Exercise;
  // Definimos los sets para que coincidan con lo que pide el creador de rutinas
  sets: { 
    type: string; // O puedes usar: "normal" | "warmup" | "failure" | "drop"
    reps: number; 
    weight: number; 
  }[];
  notes?: string;
}

export interface Routine {
  id?: string; // El id es opcional porque Firebase lo genera después
  name: string;
  description?: string;
  userId: string;
  exercises: RoutineExercise[];
  createdAt: any;
}