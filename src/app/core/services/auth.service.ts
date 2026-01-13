import { Injectable, inject } from '@angular/core';
import { Auth, user, updateProfile, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateEmail } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  user$ = user(this.auth);

  get currentUser() {
    return this.auth.currentUser;
  }

  async login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  // Registro: Espera 2 argumentos (email y password)
  async register(email: string, pass: string) {
    return createUserWithEmailAndPassword(this.auth, email, pass);
  }

  // Perfil: Ahora solo pide 1 argumento (displayName)
  async updateUserData(displayName: string): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error("No hay usuario");
    await updateProfile(currentUser, { 
      displayName: displayName
    });
  }

  async changeEmail(newEmail: string): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error("No hay usuario autenticado");
    try {
      await updateEmail(currentUser, newEmail);
    } catch (error) {
      console.error("Error al actualizar email:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
  }
}