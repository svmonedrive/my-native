import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideI18n, provideTheme } from 'a-common-lib';

import { APP_MESSAGES } from './app.i18n';
import { routes } from './app.routes';
import { ADMIN_THEME } from './app.theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideI18n(APP_MESSAGES),
    provideTheme(ADMIN_THEME, false),
  ],
};
