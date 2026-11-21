import {
  EnvironmentProviders,
  Injectable,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
  signal,
} from '@angular/core';
import { FirebaseApp, FirebaseOptions, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

/** Each service app has its own Firebase project, so the config is supplied per app. */
export const FIREBASE_CONFIG = new InjectionToken<FirebaseOptions>('FIREBASE_CONFIG');

/** In app.config.ts: `provideFirebase({ apiKey: '...', projectId: '...', ... })`. */
export function provideFirebase(config: FirebaseOptions): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: FIREBASE_CONFIG, useValue: config }]);
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly app: FirebaseApp;
  readonly auth: Auth;
  /** Signed-in user, or null. `undefined` until Firebase has restored the session. */
  readonly user = signal<User | null | undefined>(undefined);

  constructor() {
    const config = inject(FIREBASE_CONFIG, { optional: true });
    if (!config) throw new Error('Firebase config missing: add provideFirebase({...}) to app.config.ts');
    this.app = getApps()[0] ?? initializeApp(config);
    this.auth = getAuth(this.app);
    onAuthStateChanged(this.auth, (u) => this.user.set(u));
  }

  signInWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }
  signInWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }
  signUpWithEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }
  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }
  signOut() {
    return signOut(this.auth);
  }
}
