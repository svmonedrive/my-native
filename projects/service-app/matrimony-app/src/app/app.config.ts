import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCloudinary, provideFirebase, provideI18n, provideTheme } from 'a-common-lib';
import { cloudinaryConfig } from './cloudinary.config';
import { UsersService } from './services/users';

import { firebaseConfig } from './firebase.config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideFirebase(firebaseConfig),
    provideCloudinary(cloudinaryConfig),
    // Creates/updates users/{uid} whenever someone signs in.
    provideAppInitializer(() => void inject(UsersService)),
    // Service-specific texts go into provideI18n({ en: {...}, bn: {...}, hi: {...} }).
    provideI18n(),
    // No palette given: reuses the palette of the club the user came from.
    provideTheme(),
  ],
};
