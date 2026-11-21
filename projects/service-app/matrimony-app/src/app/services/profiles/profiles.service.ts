import { Injectable, inject } from '@angular/core';
import { FirestoreService } from 'a-common-lib';
import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
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
   * Profiles other members may see, without the member's own. Capped; add paging when the list grows.
   * Both `where`s are equality filters, so Firestore needs no extra index, and they match the read rule
   * (approved + not hidden), which a query must provably satisfy.
   */
  async listVisible(excludeUid: string, max = 50): Promise<(ProfileDoc & { id: string })[]> {
    const snap = await getDocs(
      query(
        collection(this.db, 'profiles'),
        where('status', '==', 'approved'),
        where('visibility', '==', 'registered'),
        limit(max),
      ),
    );
    return snap.docs
      .filter((d) => d.id !== excludeUid)
      .map((d) => ({ ...(d.data() as ProfileDoc), id: d.id }))
      .sort((a, b) => a.name.localeCompare(b.name));
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
