import { resolveServiceApps, SERVICE_APPS } from './service-catalog';

describe('resolveServiceApps', () => {
  it('returns every service by default', () => {
    expect(resolveServiceApps().map((a) => a.path)).toEqual(SERVICE_APPS.map((a) => a.path));
  });

  it('excludes services and applies overrides', () => {
    const apps = resolveServiceApps({
      exclude: ['doctors'],
      overrides: { landhub: { description: 'Custom' } },
    });
    expect(apps.some((a) => a.path === 'doctors')).toBe(false);
    expect(apps.find((a) => a.path === 'landhub')?.description).toBe('Custom');
  });

  it('gives each service a distinct dev port', () => {
    const ports = SERVICE_APPS.map((a) => a.devPort);
    expect(new Set(ports).size).toBe(ports.length);
  });
});
