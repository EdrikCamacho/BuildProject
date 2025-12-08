import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MeasurementService } from '../../../core/services/measurement.service';
import { BodyMeasurements, METRIC_LABELS } from '../../../core/models/measurement.model';

@Component({
  selector: 'app-measurement-add',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './measurement-add.component.html'
})
export class MeasurementAddComponent implements OnInit {
  date = new Date().toISOString().split('T')[0];
  values: BodyMeasurements = {};
  previewImage: string | null = null;
  isEditMode = false;
  currentLogId: string | null = null;

  categories = [
    { name: 'General', keys: ['weight', 'bodyFat', 'leanMass'] },
    { name: 'Torso', keys: ['neck', 'shoulders', 'chest', 'waist', 'abdomen', 'hips'] },
    { name: 'Brazos', keys: ['leftBicep', 'rightBicep', 'leftForearm', 'rightForearm'] },
    { name: 'Piernas', keys: ['leftThigh', 'rightThigh', 'leftCalf', 'rightCalf'] },
  ];
  labels = METRIC_LABELS;

  constructor(
    private measurementService: MeasurementService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      // MODO EDICIÓN / VER DETALLE
      this.isEditMode = true;
      this.currentLogId = id;
      this.measurementService.getLogById(id).subscribe(log => {
        if (log) {
          this.date = log.date;
          this.values = { ...log.values }; // Copia para no mutar directo
          this.previewImage = log.photos && log.photos.length > 0 ? log.photos[0] : null;
        }
      });
    } else {
      // MODO CREAR (Pre-llenado inteligente)
      this.measurementService.getLastLog().subscribe(lastLog => {
        if (lastLog) {
          // Copiamos los valores del último log para facilitar la entrada
          this.values = { ...lastLog.values };
        }
      });
    }
  }

  save() {
    // VALIDACIÓN: No guardar si todo está vacío
    const hasData = Object.values(this.values).some(v => v !== null && v !== undefined && v !== '' && v !== 0);
    if (!hasData && !this.previewImage) {
      alert('Debes ingresar al menos una medida o una foto.');
      return;
    }

    const logData = {
      id: this.currentLogId || Date.now().toString(),
      date: this.date,
      values: this.values,
      photos: this.previewImage ? [this.previewImage] : []
    };

    if (this.isEditMode) {
      this.measurementService.updateLog(logData);
    } else {
      this.measurementService.addLog(logData);
    }
    
    this.router.navigate(['/measurements']);
  }

  triggerPhotoUpload() {
    this.previewImage = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop';
    alert('Simulación: Foto cargada.');
  }
}