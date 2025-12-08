import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // +ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs'; // +Subscription
import { WorkoutService } from '../../../core/services/workout.service';
import { ActiveWorkout } from '../../../core/models/workout.model';

@Component({
  selector: 'app-workout-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout-summary.component.html'
})
export class WorkoutSummaryComponent implements OnInit, OnDestroy {
  
  workout: ActiveWorkout | null = null;
  workoutDescription = '';
  currentDate = new Date(); // Para mostrar la fecha de finalización
  
  private timerSubscription: Subscription | undefined;

  constructor(
    private workoutService: WorkoutService,
    private router: Router,
    private cdr: ChangeDetectorRef // Inyectar detector
  ) {}

  ngOnInit() {
    this.workout = this.workoutService.activeWorkout;

    if (!this.workout) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // SUSCRIBIRSE AL TIMER: Para que la duración aumente en tiempo real aquí también
    this.timerSubscription = this.workoutService.timerTick$.subscribe(() => {
      // Forzar actualización de la vista para que cambien los números
      this.currentDate = new Date(); // Actualizar fecha/hora actual
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
  }

  // Getters dinámicos (se recalculan con cada latido del timer)
  get durationDisplay(): string {
    return this.workoutService.formatTime(this.workout?.durationSeconds || 0);
  }

  get totalVolume(): number {
    return this.workout?.volume || 0; // El servicio ya calcula esto, o lo calculamos aquí si es necesario
  }
  
  get totalSets(): number {
    if (!this.workout) return 0;
    // Calcular sets completados en tiempo real
    return this.workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  }

  // ACCIONES

  resumeWorkout() {
    // Simplemente volvemos atrás, el timer nunca paró
    this.router.navigate(['/tracker']);
  }

  saveWorkout() {
    console.log('Guardando entrenamiento final...', { 
      ...this.workout, 
      description: this.workoutDescription,
      endTime: new Date()
    });
    
    // AQUÍ SÍ DETENEMOS TODO
    this.workoutService.stopWorkout(); 
    
    alert('¡Entrenamiento guardado exitosamente!');
    this.router.navigate(['/dashboard']);
  }

  discardWorkout() {
    if (confirm('¿Estás SEGURO de descartar? Se perderá todo el progreso de hoy.')) {
      this.workoutService.stopWorkout();
      this.router.navigate(['/dashboard']);
    }
  }

  addPhoto() {
    alert('Funcionalidad de cámara/galería (Próximamente)');
  }
}