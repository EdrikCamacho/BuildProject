import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>', // Renderiza directamente las rutas
  styleUrls: ['./app.css'] // Apunta al CSS si lo usas, o elimínalo si usas styles.css global
})
export class App {}