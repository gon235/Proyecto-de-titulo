import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<any>;
  secondaryApp: any;

  constructor(private afAuth: AngularFireAuth) {
    this.user$ = this.afAuth.authState;
    // Inicializar la segunda instancia de Firebase
    this.secondaryApp = initializeApp(environment.firebaseConfig, 'Secondary');
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      return result;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  async registerWithoutSignIn(email: string, password: string): Promise<any> {
    try {
      // Usar la instancia secundaria para crear el usuario
      const secondaryAuth = getAuth(this.secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      
      // Cerrar sesión en la instancia secundaria si es necesario
      if (secondaryAuth.currentUser) {
        await secondaryAuth.signOut();
      }

      return userCredential;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      throw error;
    }
  }

  // Método para limpiar recursos cuando ya no se necesiten
  async destroySecondaryApp() {
    if (this.secondaryApp) {
      await this.secondaryApp.delete();
    }
  }
}
