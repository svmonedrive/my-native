import { Injectable, inject } from '@angular/core';
import { Firestore, getFirestore } from 'firebase/firestore';
import { AuthService } from '../../auth/service';

/**
 * Firestore connection for the app's own Firebase project (config comes from `provideFirebase`).
 * Deliberately generic: document shapes (users, profiles, ...) belong to each app, not the library.
 */
@Injectable({ providedIn: 'root' })
export class FirestoreService {
  readonly db: Firestore = getFirestore(inject(AuthService).app);
}
