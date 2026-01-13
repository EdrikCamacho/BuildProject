import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, updateProfile } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // Observable para saber si el usuario está logueado en cualquier parte de la app
  user$ = user(this.auth);

  constructor() {}

  // Registro
  async register(name: string, email: string, pass: string) {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, pass);
      // Guardar el nombre del usuario (Display Name)
      if (credential.user) {
        await updateProfile(credential.user, { displayName: name });
      }
      return credential;
    } catch (error) {
      throw error;
    }
  }

  // Login
  async login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  // Logout
  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/']);
  }
}