import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideI18n, provideTheme } from 'a-common-lib';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Service-specific texts go into provideI18n({ en: {...}, bn: {...}, hi: {...} }).
    provideI18n(),
    // No palette given: reuses the palette of the club the user came from.
    provideTheme(),
  ],
};
