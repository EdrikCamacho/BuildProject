import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MeasurementService } from '../../../core/services/measurement.service';
import { BodyMeasurements, METRIC_LABELS } from '../../../core/models/measurement.model';

@Component({
  selector: 'app-measurement-add',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './measurement-add.component.html'
})
export class MeasurementAddComponent {
  date = new Date().toISOString().split('T')[0]; // Fecha hoy YYYY-MM-DD
  values: BodyMeasurements = {};
  
  // Categorías para organizar el formulario y no sea una lista gigante
  categories = [
    { name: 'General', keys: ['weight', 'bodyFat', 'leanMass'] },
    { name: 'Torso', keys: ['neck', 'shoulders', 'chest', 'waist', 'abdomen', 'hips'] },
    { name: 'Brazos', keys: ['leftBicep', 'rightBicep', 'leftForearm', 'rightForearm'] },
    { name: 'Piernas', keys: ['leftThigh', 'rightThigh', 'leftCalf', 'rightCalf'] },
  ];

  labels = METRIC_LABELS;
  previewImage: string | null = null;

  constructor(
    private measurementService: MeasurementService,
    private router: Router
  ) {}

  save() {
    this.measurementService.addLog({
      id: Date.now().toString(),
      date: this.date,
      values: this.values,
      photos: this.previewImage ? [this.previewImage] : []
    });
    this.router.navigate(['/measurements']);
  }

  // Simulación de carga de foto
  triggerPhotoUpload() {
    // Aquí iría la lógica real. Por ahora simulamos.
    this.previewImage = 'assets/placeholder-body.jpg'; // Asegúrate de tener un placeholder o quita esto si no tienes imagen
    alert('Funcionalidad de cámara/galería (Backend Pendiente)');
  }
}