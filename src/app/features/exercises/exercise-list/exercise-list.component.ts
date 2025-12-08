import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ExerciseService } from '../../../core/services/exercise.service';
import { WorkoutService } from '../../../core/services/workout.service';
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
  selectedExercises: Set<string> = new Set(); // IDs de los ejercicios seleccionados

  muscleGroups = {
    primary: ['Pecho', 'Dorsales', 'Espalda', 'Lumbar', 'ABS', 'Bíceps', 'Triceps', 'Hombros', 'Cuádriceps', 'Femoral', 'Glúteos'] as MuscleGroup[],
    secondary: ['Abductores', 'Aductores', 'Antebrazos', 'Cuello', 'Gemelos', 'Trapecio'] as MuscleGroup[]
  };

  constructor(
    private exerciseService: ExerciseService,
    private workoutService: WorkoutService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.isSelectionMode = params['mode'] === 'selection';
    });

    this.exerciseService.getExercises().subscribe(data => {
      this.allExercises = data;
      this.filterExercises();
    });
  }

  // --- LÓGICA DE SELECCIÓN MÚLTIPLE ---
  toggleExerciseSelection(exercise: Exercise) {
    if (!this.isSelectionMode || !exercise.id) return;

    if (this.selectedExercises.has(exercise.id)) {
      this.selectedExercises.delete(exercise.id);
    } else {
      this.selectedExercises.add(exercise.id);
    }
  }

  isSelected(exercise: Exercise): boolean {
    return !!exercise.id && this.selectedExercises.has(exercise.id);
  }

  confirmSelection() {
    // Buscar los objetos completos de los ejercicios seleccionados
    const selected = this.allExercises.filter(ex => ex.id && this.selectedExercises.has(ex.id));
    
    // Añadirlos uno por uno al servicio
    selected.forEach(ex => this.workoutService.addExercise(ex));
    
    // Volver al tracker
    this.router.navigate(['/tracker']);
  }
  // -------------------------------------

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
  
  // Función auxiliar para navegar a detalles sin disparar la selección
  goToDetails(id: string, event: Event) {
    event.stopPropagation(); // Evita que se seleccione la tarjeta al hacer clic en Info
    this.router.navigate(['/exercises', id]);
  }
}