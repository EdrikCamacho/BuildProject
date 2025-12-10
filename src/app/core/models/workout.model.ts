import { Exercise } from './exercise.model';

export interface WorkoutSet {
  id: number;
  type: 'warmup' | 'normal' | 'failure' | 'drop';
  weight: number | null;
  reps: number | null;
  completed: boolean;
}

export interface WorkoutExercise {
  tempId: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export interface ActiveWorkout {
  id?: string; // NUEVO: ID único del historial
  name: string;
  startTime: Date;
  endTime?: Date; // NUEVO: Fecha fin
  durationSeconds: number;
  exercises: WorkoutExercise[];
  volume: number;
  description?: string; // Para las notas finales
}