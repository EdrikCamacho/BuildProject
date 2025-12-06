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
  // Modelo para el nuevo ejercicio
  newExercise = {
    name: '',
    type: 'Peso y Repeticiones', // Valor por defecto y único por ahora
    primaryMuscle: '' as MuscleGroup | '',
    secondaryMuscle: '' as MuscleGroup | '',
    equipment: '' as Equipment | '',
    notes: ''
  };

  // Listas de opciones para los selectores
  muscleGroups = {
    primary: [
      'Pecho', 'Dorsales', 'Espalda', 'Lumbar', 'ABS', 
      'Bíceps', 'Triceps', 'Hombros', 'Cuádriceps', 'Femoral', 'Glúteos'
    ] as MuscleGroup[],
    secondary: [
      'Abductores', 'Aductores', 'Antebrazos', 'Cuello', 'Gemelos', 'Trapecio', 'Cardio'
    ] as MuscleGroup[]
  };

  equipmentList: Equipment[] = [
    'Barra', 'Mancuernas', 'Máquina', 'Peso Corporal', 'Cables', 'Kettlebell'
  ];

  constructor(private router: Router) {}

  // Función para guardar el ejercicio (por ahora solo simula)
  saveExercise() {
    console.log('Guardando ejercicio...', this.newExercise);
    
    // Validar que los campos obligatorios estén llenos
    if (!this.newExercise.name || !this.newExercise.primaryMuscle || !this.newExercise.equipment) {
      alert('Por favor, completa los campos obligatorios: Nombre, Músculo Principal y Equipamiento.');
      return;
    }

    // Aquí iría la lógica para llamar al servicio y guardar en el backend
    
    // Simulamos una redirección exitosa a la lista de ejercicios
    // this.router.navigate(['/exercises']); 
    alert('Ejercicio creado exitosamente (Simulación)');
    // Opcional: limpiar el formulario
    this.newExercise = {
      name: '',
      type: 'Peso y Repeticiones',
      primaryMuscle: '',
      secondaryMuscle: '',
      equipment: '',
      notes: ''
    };
  }
}