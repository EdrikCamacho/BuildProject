import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router'; // Router ya estaba importado
import { ExerciseService } from '../../../core/services/exercise.service';
import { Exercise, MuscleGroup } from '../../../core/models/exercise.model';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './exercise-list.component.html'
})
export class ExerciseListComponent implements OnInit {
  allExercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];
  searchTerm = '';

  showFilterModal = false;
  
  activeFilters: Set<MuscleGroup> = new Set();
  tempFilters: Set<MuscleGroup> = new Set();

  // TU LISTA DE MÚSCULOS ACTUALIZADA
  muscleGroups = {
    primary: [
      'Pecho', 'Dorsales', 'Espalda', 'Lumbar', 'ABS', 
      'Bíceps', 'Triceps', 'Hombros', 'Cuádriceps', 'Femoral', 'Glúteos'
    ] as MuscleGroup[],
    
    secondary: [
      'Abductores', 'Aductores', 'Antebrazos', 'Cuello', 'Gemelos', 'Trapecio'
    ] as MuscleGroup[]
  };

  // AQUÍ AGREGAMOS private router: Router
  constructor(
    private exerciseService: ExerciseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.exerciseService.getExercises().subscribe(data => {
      this.allExercises = data;
      this.filterExercises();
    });
  }

  filterExercises() {
    this.filteredExercises = this.allExercises.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesMuscle = this.activeFilters.size === 0 || this.activeFilters.has(ex.muscle);
      return matchesSearch && matchesMuscle;
    });
  }

  openFilterModal() {
    this.tempFilters = new Set(this.activeFilters);
    this.showFilterModal = true;
  }

  closeFilterModal() {
    this.showFilterModal = false;
  }

  toggleMuscle(muscle: MuscleGroup) {
    if (this.tempFilters.has(muscle)) {
      this.tempFilters.delete(muscle);
    } else {
      this.tempFilters.add(muscle);
    }
  }

  applyFilters() {
    this.activeFilters = new Set(this.tempFilters);
    this.filterExercises();
    this.showFilterModal = false;
  }

  isMuscleSelected(muscle: MuscleGroup): boolean {
    return this.tempFilters.has(muscle);
  }

  get activeFiltersArray(): MuscleGroup[] {
    return Array.from(this.activeFilters);
  }

  removeFilter(muscle: MuscleGroup) {
    this.activeFilters.delete(muscle);
    this.filterExercises();
  }

  // FUNCIÓN MODIFICADA PARA NAVEGAR
  createCustomExercise() {
    this.router.navigate(['/exercises/create']);
  }
}