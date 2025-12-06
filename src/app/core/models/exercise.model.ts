export type MuscleGroup = 
  // Principales
  | 'Pecho' | 'Dorsales' | 'Espalda' | 'Lumbar' | 'ABS' 
  | 'Bíceps' | 'Triceps' | 'Hombros' | 'Cuádriceps' | 'Femoral' | 'Glúteos'
  // Secundarios
  | 'Abductores' | 'Aductores' | 'Antebrazos' | 'Cuello' | 'Gemelos' | 'Trapecio'
  // Extra para compatibilidad
  | 'Cardio';

export type Equipment = 'Barra' | 'Mancuernas' | 'Máquina' | 'Peso Corporal' | 'Cables' | 'Kettlebell';

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  equipment: Equipment;
  image?: string;
}