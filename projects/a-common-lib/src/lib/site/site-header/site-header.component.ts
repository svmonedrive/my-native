import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { PreferencesComponent } from '../../preferences/preferences.component';
import { scrollToSection, scrollToTop } from '../scroll';

export interface SiteLink {
  /** `id` of the section element to scroll to. */
  id: string;
  labelKey: string;
}

const SCROLLED_AFTER = 24;
const ALWAYS_SHOWN_ABOVE = 80;
const DIRECTION_THRESHOLD = 6;

/**
 * Fixed header: transparent over the hero, turns into a blurred solid bar once the page scrolls, slides away
 * while scrolling down and returns on the first upward scroll. Links smooth-scroll and highlight the current
 * section. Collapses into a hamburger menu on small screens.
 */
@Component({
  selector: 'lib-site-header',
  imports: [PreferencesComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
  host: {
    '[class.scrolled]': 'scrolled()',
    '[class.hidden]': 'hidden()',
    '[class.open]': 'menuOpen()',
  },
})
export class SiteHeaderComponent {
  readonly brandKey = input.required<string>();
  readonly links = input.required<readonly SiteLink[]>();

  protected readonly scrolled = signal(false);
  protected readonly hidden = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly active = signal('');

  private readonly doc = inject(DOCUMENT);
  private lastY = 0;
  private frame = 0;

  constructor() {
    const win = this.doc.defaultView;
    if (!win) return;
    const destroyRef = inject(DestroyRef);

    const onScroll = () => {
      if (this.frame) return;
      this.frame = win.requestAnimationFrame(() => {
        this.frame = 0;
        this.update(win.scrollY);
      });
    };
    win.addEventListener('scroll', onScroll, { passive: true });
    destroyRef.onDestroy(() => {
      win.removeEventListener('scroll', onScroll);
      if (this.frame) win.cancelAnimationFrame(this.frame);
    });

    afterNextRender(() => {
      this.lastY = win.scrollY;
      this.update(win.scrollY);
      this.observeSections(destroyRef);
    });
  }

  protected goTo(id: string, event: Event): void {
    event.preventDefault();
    this.menuOpen.set(false);
    scrollToSection(this.doc, id);
  }

  protected toTop(event: Event): void {
    event.preventDefault();
    this.menuOpen.set(false);
    scrollToTop(this.doc);
  }

  private update(y: number): void {
    this.scrolled.set(y > SCROLLED_AFTER);
    const delta = y - this.lastY;
    if (this.menuOpen() || y <= ALWAYS_SHOWN_ABOVE) {
      this.hidden.set(false);
    } else if (delta > DIRECTION_THRESHOLD) {
      this.hidden.set(true);
    } else if (delta < -DIRECTION_THRESHOLD) {
      this.hidden.set(false);
    }
    // Only move the reference once the direction is clear, so tiny jitters don't flip the header.
    if (Math.abs(delta) > DIRECTION_THRESHOLD || y <= ALWAYS_SHOWN_ABOVE) this.lastY = y;
  }

  private observeSections(destroyRef: DestroyRef): void {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) this.active.set(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const link of this.links()) {
      const el = this.doc.getElementById(link.id);
      if (el) observer.observe(el);
    }
    destroyRef.onDestroy(() => observer.disconnect());
  }
}
