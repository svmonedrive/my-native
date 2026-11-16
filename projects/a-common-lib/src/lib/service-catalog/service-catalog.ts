import { isDevMode } from '@angular/core';

export interface ServiceApp {
  /** URL segment in production, e.g. `trendhub` -> `<base href>/trendhub/`. */
  path: string;
  /** Port used by `ng serve` in development. */
  devPort: number;
}

/**
 * A service app resolved for a host. Name and description are i18n keys
 * (`service.<path>.name` / `service.<path>.description`), translated in the template with the `t` pipe.
 */
export interface ResolvedServiceApp extends ServiceApp {
  nameKey: string;
  descriptionKey: string;
  url: string;
}

/** Per-host (tenant) tweaks. Every service is shown unless excluded. */
export interface HostCatalogConfig {
  /** `path` of services this host must NOT show. */
  exclude?: readonly string[];
}

/** Single source of truth for all service apps. Add new services here (and their texts in common messages). */
export const SERVICE_APPS: readonly ServiceApp[] = [
  { path: 'trendhub', devPort: 6201 },
  { path: 'matrimony', devPort: 6202 },
  { path: 'landhub', devPort: 6203 },
  { path: 'doctors', devPort: 6204 },
];

/** Dev: each app runs on its own port. Production: served under <base href>/<path>/ (relative, so it works on any host path). */
export function serviceAppUrl(app: ServiceApp): string {
  return isDevMode() ? `http://localhost:${app.devPort}/` : `${app.path}/`;
}

/** All services minus the host's exclusions, with links and translation keys resolved. */
export function resolveServiceApps(config: HostCatalogConfig = {}): ResolvedServiceApp[] {
  const { exclude = [] } = config;
  return SERVICE_APPS.filter((app) => !exclude.includes(app.path)).map((app) => ({
    ...app,
    nameKey: `service.${app.path}.name`,
    descriptionKey: `service.${app.path}.description`,
    url: serviceAppUrl(app),
  }));
}
