import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MeasurementService } from '../../../core/services/measurement.service';
import { MeasurementLog, METRIC_LABELS } from '../../../core/models/measurement.model';

@Component({
  selector: 'app-measurement-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './measurement-list.component.html'
})
export class MeasurementListComponent implements OnInit {
  logs: MeasurementLog[] = [];
  
  // Métrica seleccionada actualmente
  selectedMetricKey: string = 'weight';
  metricLabels = METRIC_LABELS;
  metricKeys = Object.keys(METRIC_LABELS);

  // Datos para la gráfica simple (SVG)
  chartPoints: string = '';

  constructor(private measurementService: MeasurementService) {}

  ngOnInit() {
    this.measurementService.getHistory().subscribe(data => {
      this.logs = data;
      this.generateChart();
    });
  }

  selectMetric(key: string) {
    this.selectedMetricKey = key;
    this.generateChart();
  }

  // Generador de gráfica SVG simple
  generateChart() {
    // Filtramos logs que tengan valor para la métrica seleccionada
    // Ordenamos ascendente para la gráfica (antiguo -> nuevo)
    const data = this.logs
      .filter(l => (l.values as any)[this.selectedMetricKey] !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(l => (l.values as any)[this.selectedMetricKey] as number);

    if (data.length < 2) {
      this.chartPoints = '';
      return;
    }

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1; // Evitar división por cero

    // Normalizar puntos para un SVG de 100x50
    this.chartPoints = data.map((val, index) => {
      const x = (index / (data.length - 1)) * 100;
      // Invertir Y porque en SVG 0 es arriba
      const y = 50 - ((val - min) / range) * 40 - 5; 
      return `${x},${y}`;
    }).join(' ');
  }

  getValue(log: MeasurementLog): number | string {
    return (log.values as any)[this.selectedMetricKey] || '-';
  }
}