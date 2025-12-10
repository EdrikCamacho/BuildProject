import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WorkoutService } from '../../../core/services/workout.service';
import { ActiveWorkout } from '../../../core/models/workout.model';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './workout-detail.component.html'
})
export class WorkoutDetailComponent implements OnInit {
  
  workout: ActiveWorkout | undefined;

  constructor(
    private route: ActivatedRoute,
    public workoutService: WorkoutService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.workout = this.workoutService.getWorkoutById(id);
    }
  }

  get totalSets(): number {
    if (!this.workout) return 0;
    return this.workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  }
}