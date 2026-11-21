import { Component, computed, inject, input, output, signal } from '@angular/core';
import { AuthService, CloudinaryService } from 'a-common-lib';
import { MAX_PHOTOS, ProfilePhoto } from '../../models/profile';
import { thumbUrl } from '../../utils/thumb-url';

/**
 * Photo gallery manager: add photos one at a time (max 4), choose the main one, remove.
 * It only edits the list it is given (`photos` / `photosChange`); the parent saves it with the profile.
 */
@Component({
  selector: 'app-photo-gallery',
  templateUrl: './photo-gallery.component.html',
  styleUrl: './photo-gallery.component.scss',
})
export class PhotoGalleryComponent {
  private readonly auth = inject(AuthService);
  private readonly cloudinary = inject(CloudinaryService);

  readonly photos = input.required<ProfilePhoto[]>();
  readonly photosChange = output<ProfilePhoto[]>();

  protected readonly max = MAX_PHOTOS;
  protected readonly uploading = signal(false);
  protected readonly error = signal('');
  protected readonly canAdd = computed(() => this.photos().length < this.max && !this.uploading());
  protected readonly thumb = thumbUrl;

  protected async onFileChosen(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // lets the same file be chosen again later
    const uid = this.auth.auth.currentUser?.uid;
    if (!file || !uid || !this.canAdd()) return;

    this.error.set('');
    this.uploading.set(true);
    try {
      const uploaded = await this.cloudinary.uploadImage(file, `matrimony_profiles/${uid}`);
      this.photosChange.emit([...this.photos(), uploaded]);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.uploading.set(false);
    }
  }

  /** The first photo is the main one, so "make main" moves a photo to the front. */
  protected makeMain(index: number) {
    const list = [...this.photos()];
    const [photo] = list.splice(index, 1);
    this.photosChange.emit([photo, ...list]);
  }

  protected remove(index: number) {
    this.photosChange.emit(this.photos().filter((_, i) => i !== index));
  }
}
