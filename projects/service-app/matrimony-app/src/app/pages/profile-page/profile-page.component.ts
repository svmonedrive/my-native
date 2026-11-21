import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, maxLength, max, min, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthService } from 'a-common-lib';
import {
  CREATED_FOR_OPTIONS,
  EDUCATION_OPTIONS,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  MOTHER_TONGUE_OPTIONS,
  ProfileForm,
  ProfilePhoto,
  RELIGION_OPTIONS,
} from '../../models/profile';
import { ProfilesService } from '../../services/profiles';
import { PhotoGalleryComponent } from '../../components/photo-gallery';

/** The form model: same as the saved profile, except gender starts unselected. */
type ProfileModel = Omit<ProfileForm, 'gender'> & { gender: ProfileForm['gender'] | '' };

const emptyProfile = (): ProfileModel => ({
  createdFor: 'self',
  name: '',
  gender: '',
  dob: '',
  maritalStatus: 'never-married',
  heightCm: 160,
  religion: '',
  motherTongue: '',
  education: '',
  occupation: '',
  city: '',
  state: '',
  country: 'India',
  about: '',
  photos: [],
});

@Component({
  selector: 'app-profile-page',
  imports: [FormField, FormRoot, PhotoGalleryComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly profiles = inject(ProfilesService);
  private readonly router = inject(Router);

  protected readonly createdFor = CREATED_FOR_OPTIONS;
  protected readonly genders = GENDER_OPTIONS;
  protected readonly maritalStatuses = MARITAL_STATUS_OPTIONS;
  protected readonly religions = RELIGION_OPTIONS;
  protected readonly motherTongues = MOTHER_TONGUE_OPTIONS;
  protected readonly educations = EDUCATION_OPTIONS;
  protected readonly today = new Date().toISOString().slice(0, 10);

  protected readonly loading = signal(true);
  protected readonly error = signal('');
  /** True when a profile already exists and this page edits it. */
  protected readonly editing = signal(false);

  /** The cards shown one at a time; `fields` are validated before moving to the next card. */
  protected readonly steps: { title: string; fields: (keyof ProfileModel)[] }[] = [
    { title: 'Basic details', fields: ['name', 'gender', 'dob', 'heightCm'] },
    { title: 'Background', fields: ['religion', 'motherTongue', 'education', 'occupation'] },
    { title: 'Location', fields: ['city', 'state', 'country'] },
    { title: 'About', fields: ['about'] },
    { title: 'Photos', fields: [] },
  ];
  protected readonly step = signal(0);
  protected readonly isLast = computed(() => this.step() === this.steps.length - 1);

  protected readonly model = signal<ProfileModel>(emptyProfile());

  protected readonly f = form(
    this.model,
    (p) => {
      required(p.name, { message: 'Name is required.' });
      maxLength(p.name, 80);
      required(p.gender, { message: 'Select a gender.' });
      required(p.dob, { message: 'Date of birth is required.' });
      required(p.heightCm, { message: 'Height is required.' });
      min(p.heightCm, 120, { message: 'Height must be 120 to 230 cm.' });
      max(p.heightCm, 230, { message: 'Height must be 120 to 230 cm.' });
      required(p.religion, { message: 'Select a religion.' });
      required(p.motherTongue, { message: 'Select a language.' });
      required(p.education, { message: 'Select an education level.' });
      required(p.occupation, { message: 'Occupation is required.' });
      required(p.city, { message: 'City is required.' });
      required(p.state, { message: 'State is required.' });
      required(p.country, { message: 'Country is required.' });
      maxLength(p.about, 1000);
    },
    {
      submission: {
        // Rejected as invalid: jump to the first card that has a problem.
        onInvalid: () => {
          const first = this.steps.findIndex((s) => this.hasErrors(s.fields));
          if (first >= 0) this.step.set(first);
        },
        // Runs only when the whole form is valid.
        action: async () => {
          const uid = this.auth.auth.currentUser?.uid;
          if (!uid) return;
          this.error.set('');
          try {
            await this.profiles.save(uid, this.model() as ProfileForm, !this.editing());
            await this.router.navigate(['/home-page']);
          } catch (e) {
            this.error.set((e as { code?: string })?.code ?? String(e));
          }
        },
      },
    },
  );

  protected setPhotos(photos: ProfilePhoto[]) {
    this.model.update((m) => ({ ...m, photos }));
  }

  protected back() {
    this.step.update((s) => Math.max(0, s - 1));
  }

  /** Moves on only when every field on the current card is valid; otherwise shows its errors. */
  protected next() {
    const { fields } = this.steps[this.step()];
    fields.forEach((k) => this.f[k]().markAsTouched());
    if (!this.hasErrors(fields)) this.step.update((s) => Math.min(this.steps.length - 1, s + 1));
  }

  private hasErrors(fields: (keyof ProfileModel)[]): boolean {
    return fields.some((k) => this.f[k]().invalid());
  }

  async ngOnInit() {
    const user = this.auth.auth.currentUser;
    try {
      const existing = user ? await this.profiles.get(user.uid) : null;
      if (existing) {
        this.editing.set(true);
        this.model.set({ ...emptyProfile(), ...existing });
      } else {
        this.model.update((m) => ({ ...m, name: user?.displayName ?? '' }));
      }
    } catch (e) {
      this.error.set((e as { code?: string })?.code ?? String(e));
    } finally {
      this.loading.set(false);
    }
  }
}
