import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Exercise } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private exercises: Exercise[] = [
    { 
      id: '1', 
      name: 'Press de Banca', 
      muscle: 'Pecho', 
      equipment: 'Barra',
      image: 'images/press-banca.jpg',
      secondaryMuscles: ['Triceps', 'Hombros'],
      videoUrl: 'https://www.youtube.com/embed/0SJy6gPw_Ik', 
      records: [
        { type: '1RM Estimado', value: '100 kg', date: '12 Ene 2025' },
        { type: 'Volumen Máximo', value: '2,400 kg', date: '10 Ene 2025' }
      ],
      history: [
        { date: 'Ayer', sets: [{ reps: 10, weight: 60 }, { reps: 8, weight: 65 }, { reps: 6, weight: 70 }] },
        { date: 'Hace 3 días', sets: [{ reps: 12, weight: 55 }, { reps: 10, weight: 60 }, { reps: 8, weight: 60 }] }
      ]
    },
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

  getExerciseById(id: string): Observable<Exercise | undefined> {
    const ex = this.exercises.find(e => e.id === id);
    return of(ex);
  }
}