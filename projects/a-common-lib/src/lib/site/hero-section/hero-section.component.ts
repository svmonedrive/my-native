import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { RevealDirective } from '../reveal.directive';
import { prefersReducedMotion, scrollToSection } from '../scroll';

const YOUTUBE_ID = /^[\w-]{11}$/;

/**
 * Full-screen intro with a headline and one call-to-action. Give the element `id="home"` to anchor it.
 * With a `videoId` it shows a muted, looping YouTube video in an oval that fades into a dark backdrop.
 */
@Component({
  selector: 'lib-hero-section',
  imports: [TranslatePipe, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
  host: { '[class.has-video]': 'videoUrl() !== null' },
})
export class HeroSectionComponent {
  readonly titleKey = input.required<string>();
  readonly subtitleKey = input.required<string>();
  /** Optional short line shown in small capitals above the subtitle. */
  readonly taglineKey = input<string>();
  readonly ctaKey = input.required<string>();
  /** `id` of the section the button scrolls to. */
  readonly ctaTarget = input.required<string>();
  /** 11-character YouTube video id (public video). Leave empty for the plain gradient hero. */
  readonly videoId = input<string>();

  private readonly doc = inject(DOCUMENT);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.startParallax());
  }

  /** Built only from a validated id, so it is safe to trust for the iframe. No video when motion is reduced. */
  protected readonly videoUrl = computed(() => {
    const id = this.videoId();
    if (!id || !YOUTUBE_ID.test(id) || prefersReducedMotion(this.doc.defaultView)) return null;
    const params = new URLSearchParams({
      autoplay: '1',
      mute: '1',
      loop: '1',
      playlist: id,
      controls: '0',
      disablekb: '1',
      modestbranding: '1',
      playsinline: '1',
      rel: '0',
    });
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`,
    );
  });

  /** Feeds the page scroll distance to the CSS (`--py`, `--fade`) while the hero is in view. */
  private startParallax(): void {
    const win = this.doc.defaultView;
    if (!win || prefersReducedMotion(win)) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const height = this.host.offsetHeight || win.innerHeight;
      const y = Math.min(Math.max(win.scrollY, 0), height); // stop moving once the hero has scrolled away
      this.host.style.setProperty('--py', String(y));
      this.host.style.setProperty('--fade', String(Math.max(0, 1 - y / (height * 0.85))));
    };
    const onScroll = () => {
      if (!frame) frame = win.requestAnimationFrame(update);
    };

    update();
    win.addEventListener('scroll', onScroll, { passive: true });
    win.addEventListener('resize', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => {
      win.removeEventListener('scroll', onScroll);
      win.removeEventListener('resize', onScroll);
      if (frame) win.cancelAnimationFrame(frame);
    });
  }

  protected go(event: Event): void {
    event.preventDefault();
    scrollToSection(this.doc, this.ctaTarget());
  }
}
