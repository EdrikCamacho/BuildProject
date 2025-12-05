export type MuscleGroup = 'Pecho' | 'Espalda' | 'Piernas' | 'Hombros' | 'Bíceps' | 'Tríceps' | 'Core' | 'Cardio';
export type Equipment = 'Barra' | 'Mancuernas' | 'Máquina' | 'Peso Corporal' | 'Cables' | 'Kettlebell';

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  equipment: Equipment;
  image?: string; // Para el futuro (gifs o imágenes)
}