import { isDevMode } from '@angular/core';

export interface ServiceApp {
  name: string;
  description: string;
  /** URL segment in production, e.g. `trendhub` -> `<base href>/trendhub/`. */
  path: string;
  /** Port used by `ng serve` in development. */
  devPort: number;
}

/** A service app resolved for a host, including its ready-to-use link. */
export interface ResolvedServiceApp extends ServiceApp {
  url: string;
}

/** Per-host (tenant) tweaks. Every service is shown unless excluded. */
export interface HostCatalogConfig {
  /** `path` of services this host must NOT show. */
  exclude?: readonly string[];
  /** Per-host name/description changes, keyed by service `path`. */
  overrides?: Readonly<Record<string, Partial<Pick<ServiceApp, 'name' | 'description'>>>>;
}

/** Single source of truth for all service apps. Add new services here only. */
export const SERVICE_APPS: readonly ServiceApp[] = [
  { name: 'Trendhub', description: 'Placeholder service app.', path: 'trendhub', devPort: 6201 },
  { name: 'Matrimony', description: 'Placeholder service app.', path: 'matrimony', devPort: 6202 },
  { name: 'Landhub', description: 'Placeholder service app.', path: 'landhub', devPort: 6203 },
  { name: 'Doctors', description: 'Placeholder service app.', path: 'doctors', devPort: 6204 },
];

/** Dev: each app runs on its own port. Production: served under <base href>/<path>/ (relative, so it works on any host path). */
export function serviceAppUrl(app: ServiceApp): string {
  return isDevMode() ? `http://localhost:${app.devPort}/` : `${app.path}/`;
}

/** All services minus the host's exclusions, with overrides applied and links resolved. */
export function resolveServiceApps(config: HostCatalogConfig = {}): ResolvedServiceApp[] {
  const { exclude = [], overrides = {} } = config;
  return SERVICE_APPS.filter((app) => !exclude.includes(app.path)).map((app) => {
    const merged = { ...app, ...overrides[app.path] };
    return { ...merged, url: serviceAppUrl(merged) };
  });
}
