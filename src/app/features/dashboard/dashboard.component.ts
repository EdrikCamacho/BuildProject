import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { WorkoutService } from '../../core/services/workout.service';
import { RoutineService } from '../../core/services/routine.service';
import { AuthService } from '../../core/services/auth.service';
import { Routine } from '../../core/models/routine.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  userName = 'Atleta';
  routines: Routine[] = [];
  activeMenuId: string | null = null;
  private userSub?: Subscription;

  constructor(
    private router: Router,
    private workoutService: WorkoutService,
    private routineService: RoutineService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.routineService.routines$.subscribe(data => {
      this.routines = data;
    });

    this.userSub = this.authService.user$.subscribe(user => {
      if (user) {
        this.userName = user.displayName || user.email?.split('@')[0] || 'Atleta';
      } else {
        this.userName = 'Atleta';
      }
    });
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  // --- ENTRENAMIENTO ---
  startEmptyWorkout() {
    this.workoutService.startNewWorkout();
    this.router.navigate(['/tracker']);
  }

  startRoutine(routine: Routine) {
    this.workoutService.startNewWorkout(routine);
    this.router.navigate(['/tracker']);
  }

  // --- GESTIÓN RUTINAS ---
  createRoutine() {
    this.routineService.initDraft();
    this.router.navigate(['/routines/create']);
  }

  editRoutine(id: string) {
    this.closeMenu();
    this.routineService.initDraft(id);
    this.router.navigate(['/routines/create', id]);
  }

  deleteRoutine(id: string) {
    this.closeMenu();
    if (confirm('¿Eliminar esta rutina?')) {
      this.routineService.deleteRoutine(id);
    }
  }
  
  renameRoutine(id: string) {
    this.closeMenu();
    const newName = prompt('Nuevo nombre:');
    if (newName) {
      this.routineService.renameRoutine(id, newName);
    }
  }

  // --- MENÚ UI ---
  toggleMenu(id: string, event: Event) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }
  
  closeMenu() {
    this.activeMenuId = null;
  }

  // --- ESTA ES LA FUNCIÓN QUE FALTABA ---
  createWithAI() {
    console.log('Abrir modal de IA');
    alert('Próximamente: Generador de rutinas con IA');
  }
}
