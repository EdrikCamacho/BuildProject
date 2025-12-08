import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ExerciseService } from '../../../core/services/exercise.service';
import { Exercise } from '../../../core/models/exercise.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exercise-detail.component.html'
})
export class ExerciseDetailComponent implements OnInit {
  exercise: Exercise | undefined;
  activeTab: 'about' | 'history' | 'charts' = 'about';
  safeVideoUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private exerciseService: ExerciseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
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
}