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
  
  // MODOS: Selección Múltiple y Reemplazo
  isSelectionMode = false;
  isReplaceMode = false; // Nuevo
  replaceIndex: number | null = null; // Nuevo

  selectedExercises: Set<string> = new Set();

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
      this.isReplaceMode = params['mode'] === 'replace'; // Detectar reemplazo
      this.replaceIndex = params['replaceIndex'] ? +params['replaceIndex'] : null;
    });

    this.exerciseService.getExercises().subscribe(data => {
      this.allExercises = data;
      this.filterExercises();
    });
  }

  // --- LÓGICA DE SELECCIÓN Y REEMPLAZO ---
  onExerciseSelect(exercise: Exercise) {
    if (this.isReplaceMode && this.replaceIndex !== null) {
      // CASO REEMPLAZAR
      this.workoutService.replaceExercise(this.replaceIndex, exercise);
      this.router.navigate(['/tracker']);
    } else if (this.isSelectionMode) {
      // CASO SELECCIÓN MÚLTIPLE
      this.toggleExerciseSelection(exercise);
    } else {
      // CASO NORMAL: Ver detalles sin salir
      this.goToDetails(exercise.id!, null);
    }
  }

  // ... (el resto de funciones como toggleExerciseSelection, filterExercises, etc. siguen igual que en tu archivo actual) ...
  // Solo asegúrate de copiar todo el archivo si tienes dudas.
  
  toggleExerciseSelection(exercise: Exercise) {
    if (!this.isSelectionMode || !exercise.id) return;
    if (this.selectedExercises.has(exercise.id)) {
      this.selectedExercises.delete(exercise.id);
    } else {
      this.selectedExercises.add(exercise.id);
    }
  }
  isSelected(exercise: Exercise): boolean { return !!exercise.id && this.selectedExercises.has(exercise.id); }
  
  confirmSelection() {
    const selected = this.allExercises.filter(ex => ex.id && this.selectedExercises.has(ex.id));
    selected.forEach(ex => this.workoutService.addExercise(ex));
    this.router.navigate(['/tracker']);
  }

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
  
  goToDetails(id: string, event: Event | null) {
    if(event) event.stopPropagation();
    this.router.navigate(['/exercises', id]);
  }
}