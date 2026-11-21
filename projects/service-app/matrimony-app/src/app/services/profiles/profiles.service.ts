import { Injectable, inject } from '@angular/core';
import { FirestoreService } from 'a-common-lib';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { NewProfileDoc, ProfileDoc, ProfileForm } from '../../models/profile';

const ageOf = (dob: string): number => {
  const born = new Date(dob);
  const now = new Date();
  const age = now.getFullYear() - born.getFullYear();
  const birthdayPassed =
    now.getMonth() > born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() >= born.getDate());
  return birthdayPassed ? age : age - 1;
};

@Injectable({ providedIn: 'root' })
export class ProfilesService {
  private readonly db = inject(FirestoreService).db;

  async get(uid: string): Promise<ProfileDoc | null> {
    const snap = await getDoc(doc(this.db, 'profiles', uid));
    return snap.exists() ? (snap.data() as ProfileDoc) : null;
  }

  /**
   * Creates or edits `profiles/{uid}` and marks `users/{uid}` as completed, in one atomic write.
   * A first save also sets status/visibility; later edits leave them alone.
   */
  async save(uid: string, form: ProfileForm, isNew: boolean): Promise<void> {
    const profileRef = doc(this.db, 'profiles', uid);
    const userRef = doc(this.db, 'users', uid);
    const batch = writeBatch(this.db);

    if (isNew) {
      const data: NewProfileDoc = {
        ...form,
        ownerUid: uid,
        age: ageOf(form.dob),
        // No review step yet, so new profiles are live straight away.
        status: 'approved',
        visibility: 'registered',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      batch.set(profileRef, data);
    } else {
      batch.update(profileRef, { ...form, age: ageOf(form.dob), updatedAt: serverTimestamp() });
    }
    batch.update(userRef, { profileId: uid, profileCompleted: true });
    await batch.commit();
  }
}
