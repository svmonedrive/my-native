import { EnvironmentProviders, Injectable, InjectionToken, inject, makeEnvironmentProviders } from '@angular/core';

/** Each app may use its own Cloudinary account and unsigned upload preset. */
export interface CloudinaryConfig {
  cloudName: string;
  /** Name of an *unsigned* upload preset. */
  uploadPreset: string;
}

export const CLOUDINARY_CONFIG = new InjectionToken<CloudinaryConfig>('CLOUDINARY_CONFIG');

/** In app.config.ts: `provideCloudinary({ cloudName: '...', uploadPreset: '...' })`. */
export function provideCloudinary(config: CloudinaryConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: CLOUDINARY_CONFIG, useValue: config }]);
}

/** What the app keeps about an uploaded image. */
export interface UploadedImage {
  url: string;
  publicId: string;
}

const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const MAX_SIDE_PX = 1280;
const JPEG_QUALITY = 0.8;

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private readonly config = inject(CLOUDINARY_CONFIG, { optional: true });

  /**
   * Compresses `file` in the browser (max 1280px, JPEG) and uploads it with the unsigned preset.
   * The file name is a timestamp; no `public_id` is sent, the preset adds its own unique suffix.
   * @param assetFolder Cloudinary `asset_folder`, e.g. `matrimony_profiles/<uid>`.
   */
  async uploadImage(file: File, assetFolder: string): Promise<UploadedImage> {
    if (!this.config) throw new Error('Cloudinary config missing: add provideCloudinary({...}) to app.config.ts');
    if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
    if (file.size > MAX_INPUT_BYTES) throw new Error('That image is larger than 15 MB.');

    const compressedBlob = await this.compress(file);
    const cleanFileName = `${Date.now()}.jpg`;

    const formData = new FormData();
    formData.append('file', compressedBlob, cleanFileName);
    formData.append('upload_preset', this.config.uploadPreset);
    formData.append('asset_folder', assetFolder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(json?.error?.message ?? `Upload failed (${response.status}).`);
    return { url: json.secure_url, publicId: json.public_id };
  }

  /** Scales the longest side down to 1280px and re-encodes as JPEG. */
  private async compress(file: File): Promise<Blob> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE_PX / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process that image.'))), 'image/jpeg', JPEG_QUALITY),
    );
  }
}
