import { FieldValue, Timestamp } from 'firebase/firestore';

export type UserStatus = 'active' | 'blocked';
export type AuthProviderName = 'google' | 'password';
export type UserLanguage = 'en' | 'bn' | 'hi';

/** Firestore document `users/{uid}`. Private account data: other members must never read it. */
export interface UserDoc {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phone: string | null;
  authProvider: AuthProviderName;
  /** Id of `profiles/{profileId}`; null until the user has created a profile. */
  profileId: string | null;
  profileCompleted: boolean;
  /** Set to 'blocked' from the Firebase console. */
  status: UserStatus;
  language?: UserLanguage;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

/** What gets written: timestamps are filled in by the server. */
export type NewUserDoc = Omit<UserDoc, 'createdAt' | 'lastLoginAt'> & {
  createdAt: FieldValue;
  lastLoginAt: FieldValue;
};
