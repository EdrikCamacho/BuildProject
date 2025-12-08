import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MeasurementLog } from '../models/measurement.model';

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  private history: MeasurementLog[] = [
    {
      id: '1',
      date: '2025-01-01',
      values: { weight: 75.5, waist: 82, bodyFat: 18 },
      photos: []
    },
    {
      id: '2',
      date: '2025-01-15',
      values: { weight: 74.8, waist: 81, bodyFat: 17.5 },
      photos: []
    },
    {
      id: '3',
      date: '2025-02-01',
      values: { weight: 74.0, waist: 80, bodyFat: 16.8 },
      photos: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop'] // Foto de prueba
    },
    {
      id: '4',
      date: '2025-02-15',
      values: { weight: 73.5, waist: 79, bodyFat: 16.2 },
      photos: []
    }
  ];

  // Obtener todo el historial ordenado
  getHistory(): Observable<MeasurementLog[]> {
    return of(this.history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }

  // Obtener un log específico por ID (para ver detalles)
  getLogById(id: string): Observable<MeasurementLog | undefined> {
    return of(this.history.find(l => l.id === id));
  }

  // Obtener el último registro (para pre-rellenar nuevos)
  getLastLog(): Observable<MeasurementLog | undefined> {
    // Como ya ordenamos en getHistory, tomamos el primero de la lista ordenada por fecha
    const sorted = [...this.history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return of(sorted[0]);
  }

  addLog(log: MeasurementLog) {
    this.history.push(log);
  }
  
  updateLog(updatedLog: MeasurementLog) {
    const index = this.history.findIndex(l => l.id === updatedLog.id);
    if (index !== -1) {
      this.history[index] = updatedLog;
    }
  }
}