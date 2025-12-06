export type MuscleGroup = 
  // Principales
  | 'Pecho' | 'Dorsales' | 'Espalda' | 'Lumbar' | 'ABS' 
  | 'Bíceps' | 'Triceps' | 'Hombros' | 'Cuádriceps' | 'Femoral' | 'Glúteos'
  // Secundarios
  | 'Abductores' | 'Aductores' | 'Antebrazos' | 'Cuello' | 'Gemelos' | 'Trapecio'
  // Extra
  | 'Cardio';

export type Equipment = 'Barra' | 'Mancuernas' | 'Máquina' | 'Peso Corporal' | 'Cables' | 'Kettlebell';

export interface Exercise {
  id?: string; // Opcional para cuando se crea
  name: string;
  muscle: MuscleGroup; // Músculo Principal (Primary)
  secondaryMuscles?: MuscleGroup[]; // CAMBIO: Array para múltiples secundarios
  equipment: Equipment;
  image?: string;
  notes?: string;
}