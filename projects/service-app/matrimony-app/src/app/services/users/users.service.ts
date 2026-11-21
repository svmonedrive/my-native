import { Injectable, effect, inject } from '@angular/core';
import { AuthService, FirestoreService } from 'a-common-lib';
import { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { NewUserDoc, UserDoc } from '../../models/user';

/** Keeps `users/{uid}` in step with the signed-in Firebase Auth user. */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly auth = inject(AuthService);
  private readonly db = inject(FirestoreService).db;
  /** One sync per uid at a time, so the sign-in effect and a guard never both create the document. */
  private readonly syncing = new Map<string, Promise<void>>();

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (user) this.ensureUserDoc(user).catch((e) => console.error('Could not sync users/' + user.uid, e));
    });
  }

  /** First login creates the document; later logins only refresh `lastLoginAt`. */
  ensureUserDoc(user: User): Promise<void> {
    let run = this.syncing.get(user.uid);
    if (!run) {
      run = this.sync(user).finally(() => this.syncing.delete(user.uid));
      this.syncing.set(user.uid, run);
    }
    return run;
  }

  /** The user's document, creating it first if the sign-in sync has not finished yet. */
  async load(user: User): Promise<UserDoc> {
    await this.ensureUserDoc(user);
    return (await getDoc(doc(this.db, 'users', user.uid))).data() as UserDoc;
  }

  private async sync(user: User): Promise<void> {
    const ref = doc(this.db, 'users', user.uid);
    if ((await getDoc(ref)).exists()) {
      await updateDoc(ref, { lastLoginAt: serverTimestamp() });
      return;
    }
    const data: NewUserDoc = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phone: user.phoneNumber,
      authProvider: user.providerData[0]?.providerId === 'google.com' ? 'google' : 'password',
      profileId: null,
      profileCompleted: false,
      status: 'active',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    await setDoc(ref, data);
  }
}
