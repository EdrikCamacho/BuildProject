import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router'; // +ActivatedRoute
import { ExerciseService } from '../../../core/services/exercise.service';
import { WorkoutService } from '../../../core/services/workout.service'; // +WorkoutService
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
  
  // MODO SELECCIÓN
  isSelectionMode = false;

  muscleGroups = {
    primary: ['Pecho', 'Dorsales', 'Espalda', 'Lumbar', 'ABS', 'Bíceps', 'Triceps', 'Hombros', 'Cuádriceps', 'Femoral', 'Glúteos'] as MuscleGroup[],
    secondary: ['Abductores', 'Aductores', 'Antebrazos', 'Cuello', 'Gemelos', 'Trapecio'] as MuscleGroup[]
  };

  constructor(
    private exerciseService: ExerciseService,
    private workoutService: WorkoutService, // Inyectar
    private router: Router,
    private route: ActivatedRoute // Inyectar
  ) {}

  ngOnInit() {
    // Detectar si estamos en modo selección
    this.route.queryParams.subscribe(params => {
      this.isSelectionMode = params['mode'] === 'selection';
    });

    this.exerciseService.getExercises().subscribe(data => {
      this.allExercises = data;
      this.filterExercises();
    });
  }

  // ... (filterExercises, openFilterModal, etc. SIGUEN IGUAL) ...
  
  // FUNCIONES DE FILTRO IGUALES QUE ANTES...
  filterExercises() {
    this.filteredExercises = this.allExercises.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesMuscle = this.activeFilters.size === 0 || this.activeFilters.has(ex.muscle);
      return matchesSearch && matchesMuscle;
    });
  }

  openFilterModal() { this.tempFilters = new Set(this.activeFilters); this.showFilterModal = true; }
  closeFilterModal() { this.showFilterModal = false; }
  toggleMuscle(muscle: MuscleGroup) { this.tempFilters.has(muscle) ? this.tempFilters.delete(muscle) : this.tempFilters.add(muscle); }
  applyFilters() { this.activeFilters = new Set(this.tempFilters); this.filterExercises(); this.showFilterModal = false; }
  isMuscleSelected(muscle: MuscleGroup): boolean { return this.tempFilters.has(muscle); }
  get activeFiltersArray(): MuscleGroup[] { return Array.from(this.activeFilters); }
  removeFilter(muscle: MuscleGroup) { this.activeFilters.delete(muscle); this.filterExercises(); }
  createCustomExercise() { this.router.navigate(['/exercises/create']); }

  // NUEVA FUNCIÓN: Al hacer clic en un ejercicio
  onExerciseSelect(exercise: Exercise) {
    if (this.isSelectionMode) {
      // 1. Añadir al workout
      this.workoutService.addExercise(exercise);
      // 2. Volver al tracker
      this.router.navigate(['/tracker']);
    } else {
      // Comportamiento normal (ir a detalles) si no estamos seleccionando
      // (Opcional, ya que el icono de Info también lo hace)
      this.router.navigate(['/exercises', exercise.id]);
    }
  }
}