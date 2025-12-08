export interface BodyMeasurements {
  weight?: number;       // Peso Corporal (kg)
  bodyFat?: number;      // Grasa Corporal (%)
  leanMass?: number;     // Masa Corporal Magra (kg)
  waist?: number;        // Cintura (cm)
  neck?: number;         // Cuello (cm)
  shoulders?: number;    // Hombro (cm)
  chest?: number;        // Pecho (cm)
  leftBicep?: number;    // Bíceps Izquierdo (cm)
  rightBicep?: number;   // Bíceps Derecho (cm)
  leftForearm?: number;  // Antebrazo Izquierdo (cm)
  rightForearm?: number; // Antebrazo Derecho (cm)
  abdomen?: number;      // Abdomen (cm)
  hips?: number;         // Caderas (cm)
  leftThigh?: number;    // Muslo Izquierdo (cm)
  rightThigh?: number;   // Muslo Derecho (cm)
  leftCalf?: number;     // Gemelo Izquierdo (cm)
  rightCalf?: number;    // Gemelo Derecho (cm)
}

export interface MeasurementLog {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  values: BodyMeasurements;
  photos?: string[]; // URLs de fotos de progreso
}

// Configuración para mostrar nombres bonitos en la UI
export const METRIC_LABELS: { [key: string]: string } = {
  weight: 'Peso Corporal (kg)',
  bodyFat: 'Grasa Corporal (%)',
  leanMass: 'Masa Magra (kg)',
  waist: 'Cintura (cm)',
  neck: 'Cuello (cm)',
  shoulders: 'Hombros (cm)',
  chest: 'Pecho (cm)',
  leftBicep: 'Bíceps Izq. (cm)',
  rightBicep: 'Bíceps Der. (cm)',
  leftForearm: 'Antebrazo Izq. (cm)',
  rightForearm: 'Antebrazo Der. (cm)',
  abdomen: 'Abdomen (cm)',
  hips: 'Caderas (cm)',
  leftThigh: 'Muslo Izq. (cm)',
  rightThigh: 'Muslo Der. (cm)',
  leftCalf: 'Gemelo Izq. (cm)',
  rightCalf: 'Gemelo Der. (cm)',
};