import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MeasurementLog } from '../models/measurement.model';

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  // Datos mock iniciales
  private history: MeasurementLog[] = [
    {
      id: '1',
      date: '2025-01-01',
      values: { weight: 75.5, waist: 82, bodyFat: 18 }
    },
    {
      id: '2',
      date: '2025-01-15',
      values: { weight: 74.8, waist: 81, bodyFat: 17.5 }
    },
    {
      id: '3',
      date: '2025-02-01',
      values: { weight: 74.0, waist: 80, bodyFat: 16.8 }
    },
    {
      id: '4',
      date: '2025-02-15',
      values: { weight: 73.5, waist: 79, bodyFat: 16.2 }
    }
  ];

  getHistory(): Observable<MeasurementLog[]> {
    // Retornamos ordenado por fecha descendente (más reciente primero)
    return of(this.history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }

  addLog(log: MeasurementLog) {
    this.history.push(log);
    console.log('Medida agregada:', log);
  }
}