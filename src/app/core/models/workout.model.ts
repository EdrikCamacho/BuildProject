import { Exercise } from './exercise.model';

export interface WorkoutSet {
  id: number;
  type: 'warmup' | 'normal' | 'failure' | 'drop';
  weight: number | null;
  reps: number | null;
  completed: boolean;
}

export interface WorkoutExercise {
  tempId: string; // ID temporal para manejarlo en la UI
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export interface ActiveWorkout {
  name: string;
  startTime: Date;
  durationSeconds: number;
  exercises: WorkoutExercise[];
  volume: number;
}