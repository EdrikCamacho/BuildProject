import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExerciseService } from '../../../core/services/exercise.service';
import { Exercise } from '../../../core/models/exercise.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exercise-detail.component.html'
})
export class ExerciseDetailComponent implements OnInit {
  exercise: Exercise | undefined;
  activeTab: 'about' | 'history' | 'charts' = 'about';
  safeVideoUrl: SafeResourceUrl | null = null;
  
  // Variables de navegación
  returnToSelection = false;
  returnToTracker = false; // NUEVO

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
    // Detectamos de dónde venimos
    this.route.queryParams.subscribe(params => {
      this.returnToSelection = params['returnTo'] === 'selection';
      this.returnToTracker = params['returnTo'] === 'tracker'; // NUEVO: Detectar tracker
    });

    if (id) {
      this.exerciseService.getExerciseById(id).subscribe(data => {
        this.exercise = data;
        if (this.exercise?.videoUrl) {
          this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.exercise.videoUrl);
        }
      });
    }
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
}