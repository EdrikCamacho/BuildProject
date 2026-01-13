import { Injectable, inject } from '@angular/core';
import { 
  Auth, user, updateProfile, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, updateEmail, updatePassword, deleteUser 
} from '@angular/fire/auth';

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

  // Registro simple: Solo crea el usuario y actualiza el nombre
  async register(email: string, pass: string, name?: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, pass);
    if (name) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    return userCredential;
  }

  async updateUserData(displayName: string): Promise<void> {
    if (!this.currentUser) throw new Error("No hay usuario");
    await updateProfile(this.currentUser, { displayName });
  }

  async changeEmail(newEmail: string): Promise<void> {
    if (!this.currentUser) throw new Error("No hay usuario autenticado");
    await updateEmail(this.currentUser, newEmail);
  }

  async updatePassword(newPass: string): Promise<void> {
    if (!this.currentUser) throw new Error("No hay usuario autenticado");
    await updatePassword(this.currentUser, newPass);
  }

  async deleteAccount(): Promise<void> {
    if (!this.currentUser) throw new Error("No hay usuario autenticado");
    await deleteUser(this.currentUser);
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
  }
}