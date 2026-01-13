import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

/// --- Imports de Firebase ---
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
// 1. NUEVO: Importar Analytics
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';

// 2. PEGA AQUÍ TUS CREDENCIALES DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyAOAw5rbqogh1ELfLnk_N7qMYoAwlddcas", // <--- Reemplaza con lo de la consola
  authDomain: "buildproject-7dc78.firebaseapp.com",
  projectId: "buildproject-7dc78",
  storageBucket: "buildproject-7dc78.firebasestorage.app",
  messagingSenderId: "763420370161",
  appId: "1:763420370161:web:7a0425bbc3057dd5e53550",
  measurementId: "G-7G1M13NKQ3"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    
    // --- Configuración de Firebase ---
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    // 2. NUEVO: Activar Analytics (Opcional)
    provideAnalytics(() => getAnalytics())
  ]
};