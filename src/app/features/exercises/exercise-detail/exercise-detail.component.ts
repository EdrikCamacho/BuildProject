import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExerciseService } from '../../../core/services/exercise.service';
import { WorkoutService } from '../../../core/services/workout.service';
import { Exercise, ExerciseLog, PersonalRecord, ExerciseSet } from '../../../core/models/exercise.model';
import { ActiveWorkout } from '../../../core/models/workout.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exercise-detail.component.html'
})
export class ExerciseDetailComponent implements OnInit, OnDestroy {
  exercise: Exercise | undefined;
  activeTab: 'about' | 'history' | 'charts' = 'about';
  safeVideoUrl: SafeResourceUrl | null = null;

  // Variables de navegación
  returnToSelection = false;
  returnToTracker = false;

  // Real data from workouts
  realHistory: ExerciseLog[] = [];
  realRecords: PersonalRecord[] = [];
  chartData: { volume: number[]; oneRepMax: number[] } = { volume: [], oneRepMax: [] };

  private workouts: ActiveWorkout[] = [];
  private historySub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
    private workoutService: WorkoutService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    // Detectamos de dónde venimos
    this.route.queryParams.subscribe(params => {
      this.returnToSelection = params['returnTo'] === 'selection';
      this.returnToTracker = params['returnTo'] === 'tracker';
    });

    // Subscribe to workout history
    this.historySub = this.workoutService.history$.subscribe(workouts => {
      this.workouts = workouts;
      if (this.exercise) {
        this.calculateRealData();
      }
    });

    if (id) {
      this.exerciseService.getExerciseById(id).subscribe(data => {
        this.exercise = data;
        if (this.exercise?.videoUrl) {
          this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.exercise.videoUrl);
        }
        this.calculateRealData();
      });
    }
  }

  ngOnDestroy() {
    this.historySub?.unsubscribe();
  }

  setActiveTab(tab: 'about' | 'history' | 'charts') {
    this.activeTab = tab;
  }

  // Lógica de retorno inteligente
  goBack() {
    if (this.returnToTracker) {
      // CASO 1: Volver al entrenamiento activo
      this.router.navigate(['/tracker']);
    } else if (this.returnToSelection) {
      // CASO 2: Volver a la selección (biblioteca con checks)
      this.router.navigate(['/exercises'], { queryParams: { mode: 'selection' } });
    } else {
      // CASO 3: Volver a la biblioteca normal (perfil)
      this.router.navigate(['/exercises']);
    }
  }

  private calculateRealData() {
    if (!this.exercise) return;

    this.realHistory = this.generateExerciseHistory();
    this.realRecords = this.calculatePersonalRecords();
    this.chartData = this.generateChartData();
  }

  private generateExerciseHistory(): ExerciseLog[] {
    if (!this.exercise) return [];

    const exerciseHistory: { [date: string]: ExerciseSet[] } = {};

    // Collect all sets for this exercise from completed workouts
    this.workouts.forEach(workout => {
      if (!workout.endTime || !workout.exercises) return;

      workout.exercises.forEach(workoutEx => {
        if (workoutEx.exercise.id === this.exercise!.id && workout.endTime) {
          const dateKey = workout.endTime.toISOString().split('T')[0];
          if (!exerciseHistory[dateKey]) {
            exerciseHistory[dateKey] = [];
          }

          workoutEx.sets
            .filter(set => set.completed && set.weight && set.reps)
            .forEach(set => {
              exerciseHistory[dateKey].push({
                weight: set.weight!,
                reps: set.reps!
              });
            });
        }
      });
    });

    // Convert to ExerciseLog format and sort by date descending
    return Object.entries(exerciseHistory)
      .map(([date, sets]) => ({
        date: this.formatDate(new Date(date)),
        sets: sets
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private calculatePersonalRecords(): PersonalRecord[] {
    if (!this.exercise || this.realHistory.length === 0) return [];

    let maxWeight = 0;
    let maxVolume = 0;
    let estimated1RM = 0;
    let maxWeightDate = '';
    let maxVolumeDate = '';
    let estimated1RMDate = '';

    this.realHistory.forEach(log => {
      const totalVolume = log.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);

      log.sets.forEach(set => {
        // Max weight
        if (set.weight > maxWeight) {
          maxWeight = set.weight;
          maxWeightDate = log.date;
        }

        // Max volume (single set)
        const setVolume = set.weight * set.reps;
        if (setVolume > maxVolume) {
          maxVolume = setVolume;
          maxVolumeDate = log.date;
        }

        // Estimated 1RM using Brzycki formula: weight / (1.0278 - 0.0278 * reps)
        const estimated = set.reps <= 10 ? set.weight / (1.0278 - 0.0278 * set.reps) : set.weight;
        if (estimated > estimated1RM) {
          estimated1RM = estimated;
          estimated1RMDate = log.date;
        }
      });
    });

    const records: PersonalRecord[] = [];

    if (estimated1RM > 0) {
      records.push({
        type: '1RM Estimado',
        value: Math.round(estimated1RM) + ' kg',
        date: estimated1RMDate
      });
    }

    if (maxVolume > 0) {
      records.push({
        type: 'Volumen Máximo',
        value: maxVolume + ' kg',
        date: maxVolumeDate
      });
    }

    if (maxWeight > 0) {
      records.push({
        type: 'Peso Máximo',
        value: maxWeight + ' kg',
        date: maxWeightDate
      });
    }

    return records;
  }

  private generateChartData(): { volume: number[]; oneRepMax: number[] } {
    if (!this.exercise || this.realHistory.length === 0) {
      return { volume: [], oneRepMax: [] };
    }

    // Sort history by date ascending for trend
    const sortedHistory = [...this.realHistory].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const volumeTrend: number[] = [];
    const oneRepMaxTrend: number[] = [];

    sortedHistory.forEach(log => {
      // Volume trend
      const totalVolume = log.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
      volumeTrend.push(totalVolume);

      // 1RM trend
      let max1RM = 0;
      log.sets.forEach(set => {
        const estimated = set.reps <= 10 ? set.weight / (1.0278 - 0.0278 * set.reps) : set.weight;
        max1RM = Math.max(max1RM, estimated);
      });
      oneRepMaxTrend.push(Math.round(max1RM));
    });

    // Convert to percentages for chart display (similar to profile)
    const maxVolume = Math.max(...volumeTrend);
    const max1RM = Math.max(...oneRepMaxTrend);

    return {
      volume: volumeTrend.map(v => maxVolume > 0 ? Math.max(10, (v / maxVolume) * 100) : 10),
      oneRepMax: oneRepMaxTrend.map(v => max1RM > 0 ? Math.max(10, (v / max1RM) * 100) : 10)
    };
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
