export type MuscleGroup = 
  // Principales
  | 'Pecho' | 'Dorsales' | 'Espalda' | 'Lumbar' | 'ABS' 
  | 'Bíceps' | 'Triceps' | 'Hombros' | 'Cuádriceps' | 'Femoral' | 'Glúteos'
  // Secundarios
  | 'Abductores' | 'Aductores' | 'Antebrazos' | 'Cuello' | 'Gemelos' | 'Trapecio'
  | 'Cardio';

export type Equipment = 'Barra' | 'Mancuernas' | 'Máquina' | 'Peso Corporal' | 'Cables' | 'Kettlebell';

// --- NUEVAS INTERFACES ---
export interface ExerciseSet {
  reps: number;
  weight: number;
}

export interface ExerciseLog {
  date: string; // Fecha del entrenamiento
  sets: ExerciseSet[]; // Series realizadas ese día
}

export interface PersonalRecord {
  type: '1RM Estimado' | 'Volumen Máximo' | 'Peso Máximo';
  value: string;
  date: string;
}
// -------------------------

export interface Exercise {
  id?: string;
  name: string;
  muscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  image?: string;
  notes?: string;
  
  // --- NUEVAS PROPIEDADES PARA EL DETALLE ---
  videoUrl?: string; // URL del video explicativo (YouTube, etc.)
  history?: ExerciseLog[]; // Historial de entrenamientos
  records?: PersonalRecord[]; // Récords personales
  // -----------------------------------------
}