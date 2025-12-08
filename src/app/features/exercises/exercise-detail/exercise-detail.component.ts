import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// CAMBIO AQUÍ: Quitamos 'RouterLink' de los imports, pero DEJAMOS 'Router' y 'ActivatedRoute'
import { ActivatedRoute, Router } from '@angular/router'; 
import { ExerciseService } from '../../../core/services/exercise.service';
import { Exercise } from '../../../core/models/exercise.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  // CAMBIO AQUÍ: Quitamos RouterLink de este array
  imports: [CommonModule], 
  templateUrl: './exercise-detail.component.html'
})
export class ExerciseDetailComponent implements OnInit {
  // ... (el resto del código sigue exactamente igual)
  exercise: Exercise | undefined;
  activeTab: 'about' | 'history' | 'charts' = 'about';
  safeVideoUrl: SafeResourceUrl | null = null;
  returnToSelection = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
    this.route.queryParams.subscribe(params => {
      this.returnToSelection = params['returnTo'] === 'selection';
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

  goBack() {
    if (this.returnToSelection) {
      this.router.navigate(['/exercises'], { queryParams: { mode: 'selection' } });
    } else {
      this.router.navigate(['/exercises']);
    }
  }
}