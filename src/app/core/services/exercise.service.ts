import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Exercise } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private exercises: Exercise[] = [
    { id: '1', name: 'Press de Banca', muscle: 'Pecho', equipment: 'Barra' },
    { id: '2', name: 'Sentadilla', muscle: 'Cuádriceps', equipment: 'Barra' },
    { id: '3', name: 'Peso Muerto', muscle: 'Espalda', equipment: 'Barra' },
    { id: '4', name: 'Dominadas', muscle: 'Dorsales', equipment: 'Peso Corporal' },
    { id: '5', name: 'Press Militar', muscle: 'Hombros', equipment: 'Barra' },
    { id: '6', name: 'Curl de Bíceps', muscle: 'Bíceps', equipment: 'Mancuernas' },
    { id: '7', name: 'Extensiones de Tríceps', muscle: 'Triceps', equipment: 'Cables' },
    { id: '8', name: 'Prensa de Piernas', muscle: 'Cuádriceps', equipment: 'Máquina' },
    { id: '9', name: 'Crunches', muscle: 'ABS', equipment: 'Peso Corporal' },
    { id: '10', name: 'Remo con Barra', muscle: 'Espalda', equipment: 'Barra' },
    { id: '11', name: 'Aperturas', muscle: 'Pecho', equipment: 'Mancuernas' },
    { id: '12', name: 'Zancadas', muscle: 'Femoral', equipment: 'Mancuernas' },
    { id: '13', name: 'Elevaciones Laterales', muscle: 'Hombros', equipment: 'Mancuernas' },
    { id: '14', name: 'Jalón al Pecho', muscle: 'Dorsales', equipment: 'Cables' },
    { id: '15', name: 'Hip Thrust', muscle: 'Glúteos', equipment: 'Barra' },
    { id: '16', name: 'Elevación de Talones', muscle: 'Gemelos', equipment: 'Máquina' },
    { id: '17', name: 'Hiperextensiones', muscle: 'Lumbar', equipment: 'Peso Corporal' }
  ];

  getExercises(): Observable<Exercise[]> {
    return of(this.exercises);
  }
}