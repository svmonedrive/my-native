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

/** One palette per club. Add a new entry when a new host app is created. */
export const THEME_PALETTES = {
  default: {
    light: { primary: '#2563eb', onPrimary: '#ffffff', secondary: '#475569', accent: '#d97706' },
    dark: { primary: '#60a5fa', onPrimary: '#0b1220', secondary: '#94a3b8', accent: '#fbbf24' },
  },
  kakdwip: {
    light: { primary: '#0f766e', onPrimary: '#ffffff', secondary: '#0369a1', accent: '#d97706' },
    dark: { primary: '#2dd4bf', onPrimary: '#04201d', secondary: '#38bdf8', accent: '#fbbf24' },
  },
  namkhana: {
    light: { primary: '#4338ca', onPrimary: '#ffffff', secondary: '#be185d', accent: '#4d7c0f' },
    dark: { primary: '#818cf8', onPrimary: '#0f1033', secondary: '#f472b6', accent: '#a3e635' },
  },
} as const satisfies Record<string, ThemePalette>;

export type PaletteId = keyof typeof THEME_PALETTES;

/** Shared by every app (same origin in production). */
export const MODE_STORAGE_KEY = 'my-native.mode';
export const PALETTE_STORAGE_KEY = 'my-native.palette';

const isPalette = (v: unknown): v is PaletteId => typeof v === 'string' && v in THEME_PALETTES;

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
  readonly palette = signal<PaletteId>(this.initialPalette());

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
   * Host apps call this (via `provideTheme('<club>')`) to claim their palette. It is remembered so service apps
   * opened from that club on the same origin use the same colours.
   */
  setPalette(id: PaletteId): void {
    this.palette.set(id);
    write(PALETTE_STORAGE_KEY, id);
  }

  /** Writes CSS variables onto <html>. Runs at startup (before first paint) and on every change. */
  apply(palette: PaletteId = this.palette(), mode: ThemeMode = this.mode()): void {
    const root = this.doc.documentElement;
    const colors: ThemeColors = THEME_PALETTES[palette][mode];
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

  private initialPalette(): PaletteId {
    const stored = read(PALETTE_STORAGE_KEY);
    return isPalette(stored) ? stored : 'default';
  }
}

/**
 * Call in each app's `app.config.ts`.
 * - Host apps: `provideTheme('kakdwip')` – fixed club palette.
 * - Service / admin apps: `provideTheme()` – reuse the palette of the club the user came from (else `default`).
 */
export function provideTheme(palette?: PaletteId): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const theme = inject(ThemeService);
      if (palette) theme.setPalette(palette);
      theme.apply();
    }),
  ]);
}
