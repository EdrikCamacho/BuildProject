import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoutineService } from '../../../core/services/routine.service';
import { Routine } from '../../../core/models/routine.model';

@Component({
  selector: 'app-routine-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './routine-create.component.html'
})
export class RoutineCreateComponent implements OnInit {
  
  get routine(): Routine | null { return this.routineService.draftRoutine; }

  constructor(
    private routineService: RoutineService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!this.routineService.draftRoutine) {
       this.routineService.initDraft(id || undefined);
    }
  }

  addExercises() {
    // IMPORTANTE: context: 'routine' es lo que le dice a la lista a dónde volver
    this.router.navigate(['/exercises'], { queryParams: { mode: 'selection', context: 'routine' } });
  }

  removeExercise(index: number) {
    if (this.routine) {
      this.routine.exercises.splice(index, 1);
    }
  }

  addSet(exerciseIndex: number) {
    if (!this.routine) return;
    
    const sets = this.routine.exercises[exerciseIndex].sets;
    const lastSet = sets[sets.length - 1];
    
    sets.push({
      type: 'normal',
      reps: lastSet ? lastSet.reps : 10,
      // CAMBIO: Ya no copiamos ni inicializamos weight
    });
  }

  removeSet(exerciseIndex: number, setIndex: number) {
    if (!this.routine) return;
    this.routine.exercises[exerciseIndex].sets.splice(setIndex, 1);
  }

  saveRoutine() {
    if (!this.routine?.name) {
      alert('Por favor, ponle un nombre a la rutina.');
      return;
    }
    if (this.routine.exercises.length === 0) {
      alert('Añade al menos un ejercicio.');
      return;
    }

    this.routineService.saveDraft();
    this.router.navigate(['/dashboard']);
  }
}