import { FieldValue, Timestamp } from 'firebase/firestore';

export type Gender = 'male' | 'female';
export type MaritalStatus = 'never-married' | 'divorced' | 'widowed';
export type CreatedFor = 'self' | 'son' | 'daughter' | 'brother' | 'sister' | 'relative';
export type ProfileStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'married';
export type ProfileVisibility = 'public' | 'registered' | 'hidden';

/** The part of a profile the member fills in on the profile page. */
export interface ProfileForm {
  createdFor: CreatedFor;
  name: string;
  gender: Gender;
  /** ISO date, yyyy-mm-dd. */
  dob: string;
  maritalStatus: MaritalStatus;
  heightCm: number;
  religion: string;
  motherTongue: string;
  education: string;
  occupation: string;
  city: string;
  state: string;
  country: string;
  about: string;
}

/** Firestore document `profiles/{profileId}`. profileId equals the owner's uid (one profile per account). */
export interface ProfileDoc extends ProfileForm {
  ownerUid: string;
  /** Derived from `dob` so Firestore can filter on it. */
  age: number;
  status: ProfileStatus;
  visibility: ProfileVisibility;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type NewProfileDoc = Omit<ProfileDoc, 'createdAt' | 'updatedAt'> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};
