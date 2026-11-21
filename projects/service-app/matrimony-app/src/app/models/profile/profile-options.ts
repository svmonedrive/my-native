import { CreatedFor, Gender, MaritalStatus } from './profile-doc';

export const CREATED_FOR_OPTIONS: { value: CreatedFor; label: string }[] = [
  { value: 'self', label: 'Myself' },
  { value: 'son', label: 'My son' },
  { value: 'daughter', label: 'My daughter' },
  { value: 'brother', label: 'My brother' },
  { value: 'sister', label: 'My sister' },
  { value: 'relative', label: 'A relative' },
];
export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];
export const MARITAL_STATUS_OPTIONS: { value: MaritalStatus; label: string }[] = [
  { value: 'never-married', label: 'Never married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];
export const RELIGION_OPTIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];
export const MOTHER_TONGUE_OPTIONS = ['Bengali', 'Hindi', 'English', 'Urdu', 'Other'];
export const EDUCATION_OPTIONS = ['Below 10th', '10th', '12th', 'Diploma', 'Graduate', 'Post graduate', 'Doctorate', 'Other'];
