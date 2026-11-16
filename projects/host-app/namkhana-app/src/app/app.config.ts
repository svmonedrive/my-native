import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideI18n, provideTheme } from 'a-common-lib';

import { APP_MESSAGES } from './app.i18n';
import { routes } from './app.routes';
import { NAMKHANA_THEME } from './app.theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideI18n(APP_MESSAGES),
    provideTheme(NAMKHANA_THEME),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
