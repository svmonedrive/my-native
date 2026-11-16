import { isDevMode } from '@angular/core';

export interface UtilityApp {
  name: string;
  description: string;
  path: string;
  devPort: number;
}

export const UTILITY_APPS: UtilityApp[] = [
  {
    name: 'Trendhub',
    description: 'Placeholder utility app.',
    path: 'trendhub',
    devPort: 6201,
  },
  {
    name: 'Matrimony',
    description: 'Calculate the average price of items.',
    path: 'matrimony',
    devPort: 6202,
  },
  {
    name: 'Landhub',
    description: 'Placeholder utility app.',
    path: 'landhub',
    devPort: 6203,
  },
  {
    name: 'Doctors',
    description: 'Placeholder utility app.',
    path: 'doctors',
    devPort: 6203,
  },
];

/** Dev: each app runs on its own port. Production: each app is served under <base href>/<path>/ (relative, so it works on any host path). */
export function appUrl(app: UtilityApp): string {
  return isDevMode() ? `http://localhost:${app.devPort}/` : `${app.path}/`;
}
