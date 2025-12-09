import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ExerciseService } from '../../../core/services/exercise.service';
import { WorkoutService } from '../../../core/services/workout.service';
import { RoutineService } from '../../../core/services/routine.service';
import { Exercise, MuscleGroup } from '../../../core/models/exercise.model';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './exercise-list.component.html'
})
export class ExerciseListComponent implements OnInit {
  // ... (variables iguales)
  allExercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];
  searchTerm = '';
  showFilterModal = false;
  activeFilters: Set<MuscleGroup> = new Set();
  tempFilters: Set<MuscleGroup> = new Set();
  isSelectionMode = false;
  isReplaceMode = false;
  replaceIndex: number | null = null;
  isRoutineContext = false;
  selectedExercises: Set<string> = new Set();
  muscleGroups = {
    primary: ['Pecho', 'Dorsales', 'Espalda', 'Lumbar', 'ABS', 'Bíceps', 'Triceps', 'Hombros', 'Cuádriceps', 'Femoral', 'Glúteos'] as MuscleGroup[],
    secondary: ['Abductores', 'Aductores', 'Antebrazos', 'Cuello', 'Gemelos', 'Trapecio'] as MuscleGroup[]
  };

  constructor(
    private exerciseService: ExerciseService,
    private workoutService: WorkoutService,
    private routineService: RoutineService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.isSelectionMode = params['mode'] === 'selection';
      this.isReplaceMode = params['mode'] === 'replace';
      this.replaceIndex = params['replaceIndex'] ? +params['replaceIndex'] : null;
      this.isRoutineContext = params['context'] === 'routine'; // LEEMOS EL CONTEXTO
    });

    this.exerciseService.getExercises().subscribe(data => {
      this.allExercises = data;
      this.filterExercises();
    });
  }

  // --- CORRECCIÓN EN CANCELAR ---
  cancelSelection() {
    if (this.isRoutineContext) {
      this.router.navigate(['/routines/create']); // Volver a Crear Rutina
    } else {
      this.router.navigate(['/tracker']); // Volver al Tracker
    }
  }

  // --- CORRECCIÓN AL IR A DETALLES ---
  goToDetails(id: string, event: Event | null) {
    if(event) event.stopPropagation();
    
    // Determinamos el valor de returnTo basado en el estado actual
    let returnToValue = null;
    if (this.isSelectionMode) returnToValue = 'selection';
    if (this.isReplaceMode) returnToValue = 'replace';

    // Navegamos pasando TAMBIÉN el contexto (routine o null)
    this.router.navigate(['/exercises', id], { 
      queryParams: { 
        returnTo: returnToValue,
        context: this.isRoutineContext ? 'routine' : null, // PASAMOS EL CONTEXTO
        replaceIndex: this.replaceIndex // Pasamos el índice si es reemplazo
      } 
    });
  }

  // ... (Resto de funciones onExerciseSelect, toggleExerciseSelection, isSelected, confirmSelection, filterExercises, modales, etc. SIGUEN IGUAL) ...
  
  onExerciseSelect(exercise: Exercise) {
    if (this.isReplaceMode && this.replaceIndex !== null) {
      this.workoutService.replaceExercise(this.replaceIndex, exercise);
      this.router.navigate(['/tracker']);
    } else if (this.isSelectionMode) {
      this.toggleExerciseSelection(exercise);
    } else {
      this.goToDetails(exercise.id!, null);
    }
  }
  
  toggleExerciseSelection(exercise: Exercise) {
    if (!this.isSelectionMode || !exercise.id) return;
    this.selectedExercises.has(exercise.id) ? this.selectedExercises.delete(exercise.id) : this.selectedExercises.add(exercise.id);
  }
  isSelected(exercise: Exercise): boolean { return !!exercise.id && this.selectedExercises.has(exercise.id); }
  
  confirmSelection() {
    const selected = this.allExercises.filter(ex => ex.id && this.selectedExercises.has(ex.id));
    if (this.isRoutineContext) {
      this.routineService.addExercisesToDraft(selected);
      this.router.navigate(['/routines/create']); 
    } else {
      selected.forEach(ex => this.workoutService.addExercise(ex));
      this.router.navigate(['/tracker']);
    }
  }
  
  // ... Filtros y modales igual ...
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
}