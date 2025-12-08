import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
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
  selectedMetricKey: string = 'weight';
  metricLabels = METRIC_LABELS;
  metricKeys = Object.keys(METRIC_LABELS);
  
  chartPoints: string = '';
  showFilterModal = false; // Control del modal

  constructor(
    private measurementService: MeasurementService, 
    private router: Router
  ) {}

  ngOnInit() {
    this.measurementService.getHistory().subscribe(data => {
      this.logs = data;
      this.generateChart();
    });
  }

  // Abrir detalle al hacer clic en el historial
  viewDetails(id: string) {
    this.router.navigate(['/measurements', id]);
  }

  // Lógica del Modal
  openFilterModal() { this.showFilterModal = true; }
  closeFilterModal() { this.showFilterModal = false; }

  selectMetric(key: string) {
    this.selectedMetricKey = key;
    this.generateChart();
    this.showFilterModal = false; // Cierra modal al elegir
  }

  // ... (generateChart y getValue siguen igual que antes) ...
  generateChart() {
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
    const range = max - min || 1;
    this.chartPoints = data.map((val, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 50 - ((val - min) / range) * 40 - 5; 
      return `${x},${y}`;
    }).join(' ');
  }

  getValue(log: MeasurementLog): number | string {
    return (log.values as any)[this.selectedMetricKey] || '-';
  }
}