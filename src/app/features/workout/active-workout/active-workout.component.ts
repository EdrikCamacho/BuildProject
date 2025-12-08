import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // 1. IMPORTAR ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs'; // 2. IMPORTAR Subscription
import { WorkoutService } from '../../../core/services/workout.service';
import { ActiveWorkout, WorkoutSet } from '../../../core/models/workout.model';

@Component({
  selector: 'app-active-workout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './active-workout.component.html'
})
export class ActiveWorkoutComponent implements OnInit, OnDestroy {
  
  activeMenuIndex: number | null = null;
  showRestSettings = false;
  restOptions = [30, 60, 90, 120, 180, 300]; 
  
  // Variable para guardar la suscripción
  private timerSubscription: Subscription | undefined;

  get workout(): ActiveWorkout | null { return this.workoutService.activeWorkout; }
  get timerDisplay(): string { return this.workoutService.formatTime(this.workout?.durationSeconds || 0); }
  get isResting(): boolean { return this.workoutService.isResting; }
  get restTimerDisplay(): string { return this.workoutService.formatTime(this.workoutService.restDurationRemaining); }
  get currentRestTime(): number { return this.workoutService.defaultRestSeconds; }

  constructor(
    private router: Router, 
    public workoutService: WorkoutService,
    private cdr: ChangeDetectorRef // 3. INYECTAR DETECTOR DE CAMBIOS
  ) {}

  ngOnInit() {
    if (!this.workoutService.activeWorkout) {
      this.router.navigate(['/dashboard']);
      return; // Importante detener si no hay workout
    }

    // 4. SUSCRIBIRSE AL LATIDO DEL SERVICIO
    // Cada vez que el servicio diga "next()", actualizamos la vista manualmente
    this.timerSubscription = this.workoutService.timerTick$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    // 5. LIMPIAR SUSCRIPCIÓN AL SALIR
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  // ... (El resto de funciones: toggleMenu, viewInstructions, etc. siguen EXACTAMENTE IGUAL) ...
  
  toggleMenu(index: number, event: Event) {
    event.stopPropagation();
    this.activeMenuIndex = this.activeMenuIndex === index ? null : index;
  }

  closeMenu() {
    this.activeMenuIndex = null;
    this.showRestSettings = false;
  }

  viewInstructions(exerciseId: string) {
    this.closeMenu();
    this.router.navigate(['/exercises', exerciseId], { queryParams: { returnTo: 'tracker' } });
  }

  startReplacing(index: number) {
    this.closeMenu();
    this.router.navigate(['/exercises'], { queryParams: { mode: 'replace', replaceIndex: index } });
  }

  removeExerciseUi(index: number) {
    this.closeMenu();
    setTimeout(() => {
      if (confirm('¿Eliminar este ejercicio de la rutina?')) {
        this.workoutService.removeExercise(index);
      }
    }, 100);
  }

  addSet(exerciseIndex: number) {
    if (!this.workout) return;
    const sets = this.workout.exercises[exerciseIndex].sets;
    const lastSet = sets[sets.length - 1];
    sets.push({ id: sets.length + 1, type: 'normal', weight: lastSet ? lastSet.weight : null, reps: lastSet ? lastSet.reps : null, completed: false });
  }
  
  removeSet(exerciseIndex: number, setIndex: number) {
    if (!this.workout) return;
    this.workout.exercises[exerciseIndex].sets.splice(setIndex, 1);
  }
  
  toggleSetCompletion(set: WorkoutSet) {
    set.completed = !set.completed;
    if (set.completed) this.workoutService.startRestTimer();
  }

  skipRest() { this.workoutService.stopRestTimer(); }
  addRestTime(seconds: number) { this.workoutService.addTimeToShow(seconds); }

  openRestSettings(event: Event) {
    event.stopPropagation();
    this.showRestSettings = true;
  }

  selectRestTime(seconds: number) {
    this.workoutService.updateRestTime(seconds);
    this.showRestSettings = false;
  }

  addExercise() { this.router.navigate(['/exercises'], { queryParams: { mode: 'selection' } }); }
  finishWorkout() { if(confirm('¿Terminar?')) { this.workoutService.stopWorkout(); this.router.navigate(['/dashboard']); } }
  cancelWorkout() { if(confirm('¿Descartar?')) { this.workoutService.stopWorkout(); this.router.navigate(['/dashboard']); } }
}