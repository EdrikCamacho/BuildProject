import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent {
  // Datos simulados para visualizar la interfaz
  userName = 'Atleta';
  
  weeklyWorkouts = [
    { day: 'L', completed: true },
    { day: 'M', completed: true },
    { day: 'X', completed: false },
    { day: 'J', completed: true },
    { day: 'V', completed: false },
    { day: 'S', completed: false },
    { day: 'D', completed: false },
  ];

  recentActivity = [
    { title: 'Push Day A', date: 'Hoy', duration: '45 min', volume: '3,240 kg' },
    { title: 'Leg Day', date: 'Ayer', duration: '60 min', volume: '5,100 kg' },
  ];
}