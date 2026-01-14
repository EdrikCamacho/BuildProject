import { Component, inject, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { WorkoutService } from '../../core/services/workout.service';
import { AuthService } from '../../core/services/auth.service';
import { ActiveWorkout } from '../../core/models/workout.model';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit, OnDestroy {
  public workoutService = inject(WorkoutService);
  private router = inject(Router);
  public authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  user = { name: 'Atleta', photoUrl: '', joinDate: 'Diciembre 2025', avatarLetter: 'A' };
  currentPeriod: string = '1S';
  periods: string[] = ['1S', '1M', '3M', '1A', 'Todo'];

  get currentStats() {
    return this.calculateAnalytics(this.currentPeriod);
  }

  setPeriod(p: string) {
    this.currentPeriod = p;
  }

  menuItems = [
    { title: 'Medidas Corporales', icon: '📏', desc: 'Registra tu peso y perímetros', route: '/measurements' },
    { title: 'Biblioteca de Ejercicios', icon: '📚', desc: 'Tutoriales e historial por ejercicio', route: '/exercises' }
  ];

  history$ = this.workoutService.history$;
  activeMenuId: string | null = null;
  private historySub?: Subscription;
  private workouts: ActiveWorkout[] = [];
  private analyticsCache: { [period: string]: any } = {};

  ngOnInit() {
    // Forzamos la detección de cambios cuando el historial emite datos
    this.historySub = this.history$.subscribe(workouts => {
      this.workouts = workouts;
      this.updateAnalyticsCache();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.historySub?.unsubscribe();
  }

  getSetsCount(workout: ActiveWorkout): number {
    if (!workout.exercises) return 0;
    return workout.exercises.reduce((acc, ex) => acc + (ex.sets ? ex.sets.filter(s => s.completed).length : 0), 0);
  }

  viewWorkoutDetail(id: string) {
    this.router.navigate(['/history', id]);
  }

  toggleMenu(id: string, event: Event) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  closeMenu() {
    this.activeMenuId = null;
  }

  repeatWorkout(workout: ActiveWorkout, event: Event) {
    event.stopPropagation();
    this.closeMenu();
    
    this.workoutService.startFromPrevious(workout);
    
    // CORRECCIÓN: Usar la ruta 'tracker' que definiste en app.routes.ts
    this.router.navigate(['/tracker']); 
  }

  deleteWorkout(id: string | undefined, event: Event) {
    event.stopPropagation();
    this.closeMenu();
    if (!id) return;
    if (confirm('¿Eliminar este entrenamiento del historial?')) {
      this.workoutService.deleteFromHistory(id);
    }
  }

  private updateAnalyticsCache() {
    this.analyticsCache = {};
    this.periods.forEach(period => {
      this.analyticsCache[period] = this.calculateAnalyticsForPeriod(period);
    });
  }

  private calculateAnalytics(period: string): any {
    if (this.analyticsCache[period]) {
      return this.analyticsCache[period];
    }
    return this.calculateAnalyticsForPeriod(period);
  }

  private calculateAnalyticsForPeriod(period: string): any {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '1S':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days
        break;
      case '1M':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days
        break;
      case '3M':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days
        break;
      case '1A':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // 365 days
        break;
      case 'Todo':
      default:
        startDate = new Date(0); // All time
        break;
    }

    const filteredWorkouts = this.workouts.filter(workout =>
      workout.endTime && workout.endTime >= startDate
    );

    const totalVolume = filteredWorkouts.reduce((sum, workout) => sum + (workout.volume || 0), 0);
    const totalSets = filteredWorkouts.reduce((sum, workout) => sum + this.getSetsCount(workout), 0);

    const volumeTrend = this.generateTrend(filteredWorkouts, period, 'volume', startDate, now);
    const setsTrend = this.generateTrend(filteredWorkouts, period, 'sets', startDate, now);

    return {
      volume: this.formatVolume(totalVolume),
      sets: totalSets,
      volumeTrend,
      setsTrend
    };
  }

  private generateTrend(workouts: ActiveWorkout[], period: string, type: 'volume' | 'sets', startDate: Date, endDate: Date): number[] {
    let segments: number;

    switch (period) {
      case '1S':
        segments = 7; // Daily for 1 week
        break;
      case '1M':
        segments = 7; // Weekly for 1 month
        break;
      case '3M':
        segments = 12; // Weekly for 3 months
        break;
      case '1A':
        segments = 12; // Monthly for 1 year
        break;
      case 'Todo':
      default:
        segments = 12; // Quarterly or custom
        break;
    }

    const segmentDuration = (endDate.getTime() - startDate.getTime()) / segments;
    const trend: number[] = [];

    for (let i = 0; i < segments; i++) {
      const segmentStart = new Date(startDate.getTime() + i * segmentDuration);
      const segmentEnd = new Date(startDate.getTime() + (i + 1) * segmentDuration);

      const segmentWorkouts = workouts.filter(workout =>
        workout.endTime && workout.endTime >= segmentStart && workout.endTime < segmentEnd
      );

      let value = 0;
      if (type === 'volume') {
        value = segmentWorkouts.reduce((sum, workout) => sum + (workout.volume || 0), 0);
      } else {
        value = segmentWorkouts.reduce((sum, workout) => sum + this.getSetsCount(workout), 0);
      }

      // Convert to percentage (0-100) relative to max value, or minimum 10% for visibility
      const maxValue = Math.max(...trend.concat([value]));
      const percentage = maxValue > 0 ? Math.max(10, (value / maxValue) * 100) : 10;
      trend.push(Math.round(percentage));
    }

    return trend;
  }

  private formatVolume(volume: number): string {
    if (volume >= 1000) {
      return (volume / 1000).toFixed(1) + 'T';
    }
    return volume.toString();
  }
}
