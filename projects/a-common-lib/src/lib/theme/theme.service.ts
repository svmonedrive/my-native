import {
  DOCUMENT,
  EnvironmentProviders,
  Injectable,
  effect,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
  signal,
} from '@angular/core';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  /** Text/icon colour used on top of `primary`. */
  onPrimary: string;
  secondary: string;
  accent: string;
}

export interface ThemePalette {
  light: ThemeColors;
  dark: ThemeColors;
}

/** Surfaces are shared by every club; only primary / secondary / accent differ per club. */
const SURFACES: Record<ThemeMode, Record<string, string>> = {
  light: { bg: '#f7f8fa', surface: '#ffffff', text: '#1b1f24', muted: '#5b6470', border: '#d5dae1' },
  dark: { bg: '#0f1318', surface: '#1a2028', text: '#e8ebef', muted: '#9aa4b1', border: '#2c3540' },
};

/** Used when an app (service apps, admin) has no palette of its own and no club palette was stored. */
export const DEFAULT_THEME_PALETTE: ThemePalette = {
  light: { primary: '#2563eb', onPrimary: '#ffffff', secondary: '#475569', accent: '#d97706' },
  dark: { primary: '#60a5fa', onPrimary: '#0b1220', secondary: '#94a3b8', accent: '#fbbf24' },
};

/** Shared by every app (same origin in production). */
export const MODE_STORAGE_KEY = 'my-native.mode';
export const PALETTE_STORAGE_KEY = 'my-native.palette';

const HEX = /^#[0-9a-f]{6}$/i;
const isColors = (v: unknown): v is ThemeColors =>
  !!v && ['primary', 'onPrimary', 'secondary', 'accent'].every((k) => HEX.test((v as Record<string, string>)[k] ?? ''));
const isPalette = (v: unknown): v is ThemePalette =>
  !!v && isColors((v as ThemePalette).light) && isColors((v as ThemePalette).dark);

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: keep in memory only */
  }
};

const BASE_CSS = `
body { margin: 0; background: var(--color-bg); color: var(--color-text);
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Noto Sans Bengali', 'Noto Sans Devanagari', sans-serif; }
`;

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);

  readonly mode = signal<ThemeMode>(this.initialMode());
  readonly palette = signal<ThemePalette>(this.initialPalette());

  constructor() {
    effect(() => this.apply(this.palette(), this.mode()));
  }

  toggleMode(): void {
    this.setMode(this.mode() === 'dark' ? 'light' : 'dark');
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    write(MODE_STORAGE_KEY, mode);
  }

  /**
   * Sets this app's palette. With `remember` (default) it is also stored, so service apps opened from this
   * club on the same origin pick up the same colours.
   */
  setPalette(palette: ThemePalette, remember = true): void {
    this.palette.set(palette);
    if (remember) write(PALETTE_STORAGE_KEY, JSON.stringify(palette));
  }

  /** Writes CSS variables onto <html>. Runs at startup (before first paint) and on every change. */
  apply(palette: ThemePalette = this.palette(), mode: ThemeMode = this.mode()): void {
    const root = this.doc.documentElement;
    const colors: ThemeColors = palette[mode];
    const vars: Record<string, string> = {
      'color-primary': colors.primary,
      'color-on-primary': colors.onPrimary,
      'color-secondary': colors.secondary,
      'color-accent': colors.accent,
      ...Object.fromEntries(Object.entries(SURFACES[mode]).map(([k, v]) => [`color-${k}`, v])),
    };
    for (const [name, value] of Object.entries(vars)) root.style.setProperty(`--${name}`, value);
    root.style.colorScheme = mode;
    root.dataset['theme'] = mode;
    this.ensureBaseStyles();
    this.setMetaThemeColor(SURFACES[mode]['surface']);
  }

  private ensureBaseStyles(): void {
    if (this.doc.getElementById('lib-theme-base')) return;
    const style = this.doc.createElement('style');
    style.id = 'lib-theme-base';
    style.textContent = BASE_CSS;
    this.doc.head.appendChild(style);
  }

  private setMetaThemeColor(color: string): void {
    let meta = this.doc.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = this.doc.createElement('meta');
      meta.name = 'theme-color';
      this.doc.head.appendChild(meta);
    }
    meta.content = color;
  }

  private initialMode(): ThemeMode {
    const stored = read(MODE_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark =
      typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  private initialPalette(): ThemePalette {
    try {
      const stored: unknown = JSON.parse(read(PALETTE_STORAGE_KEY) ?? 'null');
      if (isPalette(stored)) return stored;
    } catch {
      /* corrupt value: ignore */
    }
    return DEFAULT_THEME_PALETTE;
  }
}

/**
 * Call in each app's `app.config.ts`.
 * - Host apps: `provideTheme(KAKDWIP_THEME)` – the club's own palette, defined in the host app.
 * - Service apps: `provideTheme()` – reuse the palette of the club the user came from (else the default).
 * - Apps with a fixed look that must not affect others (admin): `provideTheme(ADMIN_THEME, false)`.
 */
export function provideTheme(palette?: ThemePalette, remember = true): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const theme = inject(ThemeService);
      if (palette) theme.setPalette(palette, remember);
      theme.apply();
    }),
  ]);
}
