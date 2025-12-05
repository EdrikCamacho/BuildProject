import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  selectedMuscle: MuscleGroup | 'Todos' = 'Todos';

  // Listas para los filtros (Chips)
  muscles: (MuscleGroup | 'Todos')[] = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Bíceps', 'Tríceps', 'Core'];

  constructor(private exerciseService: ExerciseService) {}

  ngOnInit() {
    this.exerciseService.getExercises().subscribe(data => {
      this.allExercises = data;
      this.filterExercises();
    });
  }

  // Lógica de filtrado en tiempo real
  filterExercises() {
    this.filteredExercises = this.allExercises.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesMuscle = this.selectedMuscle === 'Todos' || ex.muscle === this.selectedMuscle;
      return matchesSearch && matchesMuscle;
    });
  }

  selectMuscle(m: MuscleGroup | 'Todos') {
    this.selectedMuscle = m;
    this.filterExercises();
  }
}