import {
  DOCUMENT,
  EnvironmentProviders,
  Injectable,
  computed,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
  signal,
} from '@angular/core';
import { COMMON_MESSAGES } from './common-messages';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'hi', label: 'हिन्दी' },
] as const;

export type Lang = (typeof LANGUAGES)[number]['code'];
export type Messages = Readonly<Record<string, string>>;
export type MessageBundle = Readonly<Partial<Record<Lang, Messages>>>;

const DEFAULT_LANG: Lang = 'en';
/** Shared by every app (same origin in production) so the choice follows the user between host and service apps. */
export const LANG_STORAGE_KEY = 'my-native.lang';

const isLang = (value: unknown): value is Lang => LANGUAGES.some((l) => l.code === value);

/** Runtime i18n: all languages are bundled, switching is instant and needs no reload. */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly doc = inject(DOCUMENT);
  private readonly appMessages = signal<MessageBundle[]>([]);

  readonly languages = LANGUAGES;
  readonly lang = signal<Lang>(this.initialLang());

  private readonly merged = computed(() => {
    const lang = this.lang();
    const bundles = [COMMON_MESSAGES, ...this.appMessages()];
    return {
      current: Object.assign({}, ...bundles.map((b) => b[lang])) as Record<string, string>,
      fallback: Object.assign({}, ...bundles.map((b) => b[DEFAULT_LANG])) as Record<string, string>,
    };
  });

  /** Registers an app's own messages (later bundles win over earlier / common ones). */
  addMessages(bundle: MessageBundle): void {
    this.appMessages.update((all) => [...all, bundle]);
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      /* storage unavailable: keep the choice in memory only */
    }
    this.apply();
  }

  /** Sets <html lang>. Called once at startup and on every change. */
  apply(): void {
    this.doc.documentElement.lang = this.lang();
  }

  /** Translates `key`; falls back to English, then to the key itself. `{name}` placeholders use `params`. */
  t(key: string, params?: Record<string, string | number>): string {
    const { current, fallback } = this.merged();
    const text = current[key] ?? fallback[key] ?? key;
    return params ? text.replace(/\{(\w+)\}/g, (m, p) => (p in params ? String(params[p]) : m)) : text;
  }

  private initialLang(): Lang {
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (isLang(stored)) return stored;
    } catch {
      /* ignore */
    }
    const browser = (typeof navigator !== 'undefined' ? navigator.language : '').slice(0, 2);
    return isLang(browser) ? browser : DEFAULT_LANG;
  }
}

/** Call in each app's `app.config.ts`. Pass the app's own messages (en / bn / hi). */
export function provideI18n(messages: MessageBundle = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const i18n = inject(I18nService);
      i18n.addMessages(messages);
      i18n.apply();
    }),
  ]);
}
