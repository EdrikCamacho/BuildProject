import { Exercise } from "./exercise.model";

export interface RoutineExercise {
  exercise: Exercise;
  sets: { 
    type: "normal" | "warmup" | "failure" | "drop"; // Tipos exactos para evitar errores
    reps: number; 
    weight: number; 
  }[];
  notes?: string;
}

export interface Routine {
  id?: string;
  name: string;
  description?: string;
  userId: string;
  exercises: RoutineExercise[];
  createdAt: any;
}