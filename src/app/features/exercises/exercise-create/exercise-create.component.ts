import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MuscleGroup, Equipment } from '../../../core/models/exercise.model';

@Component({
  selector: 'app-exercise-create',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './exercise-create.component.html',
})
export class ExerciseCreateComponent {
  // Modelo actualizado
  newExercise = {
    name: '',
    primaryMuscle: '' as MuscleGroup | '',
    secondaryMuscles: [] as MuscleGroup[], // Array vacío inicial
    equipment: '' as Equipment | '',
    notes: '',
    image: null as string | null // Para la visualización de la imagen
  };

  // Listas de Músculos (La misma que en el filtro)
  muscleGroups = {
    primary: [
      'Pecho', 'Dorsales', 'Espalda', 'Lumbar', 'ABS', 
      'Bíceps', 'Triceps', 'Hombros', 'Cuádriceps', 'Femoral', 'Glúteos'
    ] as MuscleGroup[],
    secondary: [
      'Abductores', 'Aductores', 'Antebrazos', 'Cuello', 'Gemelos', 'Trapecio'
    ] as MuscleGroup[]
  };

  equipmentList: Equipment[] = [
    'Barra', 'Mancuernas', 'Máquina', 'Peso Corporal', 'Cables', 'Kettlebell'
  ];

  // Lógica del Modal
  showModal = false;
  modalMode: 'primary' | 'secondary' = 'primary'; // Controla qué estamos seleccionando
  tempSelection: Set<MuscleGroup> = new Set(); // Selección temporal dentro del modal

  constructor(private router: Router) {}

  // Abrir modal configurado para el modo correcto
  openMuscleSelector(mode: 'primary' | 'secondary') {
    this.modalMode = mode;
    this.tempSelection.clear();

    // Cargar selección actual en el temporal
    if (mode === 'primary' && this.newExercise.primaryMuscle) {
      this.tempSelection.add(this.newExercise.primaryMuscle);
    } else if (mode === 'secondary') {
      this.newExercise.secondaryMuscles.forEach(m => this.tempSelection.add(m));
    }

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  // Lógica de selección inteligente
  toggleMuscle(muscle: MuscleGroup) {
    if (this.modalMode === 'primary') {
      // Modo Único: Si seleccionas uno, borras los demás (radio behavior)
      this.tempSelection.clear();
      this.tempSelection.add(muscle);
    } else {
      // Modo Múltiple: Toggle normal (checkbox behavior)
      if (this.tempSelection.has(muscle)) {
        this.tempSelection.delete(muscle);
      } else {
        this.tempSelection.add(muscle);
      }
    }
  }

  // Guardar lo seleccionado en el modal al formulario real
  applySelection() {
    if (this.modalMode === 'primary') {
      // Tomamos el primer (y único) valor del set
      const selected = Array.from(this.tempSelection)[0];
      this.newExercise.primaryMuscle = selected || '';
    } else {
      // Convertimos el set a array
      this.newExercise.secondaryMuscles = Array.from(this.tempSelection);
    }
    this.showModal = false;
  }

  // Helpers visuales
  isMuscleSelected(muscle: MuscleGroup): boolean {
    return this.tempSelection.has(muscle);
  }

  // Simulación de carga de imagen
  triggerImageUpload() {
    console.log('Abriendo selector de archivos nativo...');
    // Aquí iría la lógica real de input file. Por ahora simulamos que se cargó una.
    // this.newExercise.image = 'assets/placeholder-image.jpg'; 
    alert('Funcionalidad de imagen (Backend Pendiente)');
  }

  saveExercise() {
    if (!this.newExercise.name || !this.newExercise.primaryMuscle || !this.newExercise.equipment) {
      alert('Por favor, completa los campos obligatorios.');
      return;
    }
    console.log('Guardando ejercicio:', this.newExercise);
    alert('Ejercicio creado exitosamente');
    this.router.navigate(['/exercises']);
  }
}