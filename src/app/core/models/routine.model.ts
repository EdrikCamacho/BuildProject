import { Exercise } from './exercise.model';

export interface RoutineSet {
  type: 'warmup' | 'normal' | 'failure' | 'drop';
  reps?: number;
  weight?: number; 
}

export interface RoutineExercise {
  exercise: Exercise;
  sets: RoutineSet[];
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  // AGREGAMOS ESTA LÍNEA:
  createdAt?: Date; 
}