import { ChangeDetectionStrategy, Component, computed, DOCUMENT, inject, input } from '@angular/core';
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
  readonly ctaKey = input.required<string>();
  /** `id` of the section the button scrolls to. */
  readonly ctaTarget = input.required<string>();
  /** 11-character YouTube video id (public video). Leave empty for the plain gradient hero. */
  readonly videoId = input<string>();

  private readonly doc = inject(DOCUMENT);
  private readonly sanitizer = inject(DomSanitizer);

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

  protected go(event: Event): void {
    event.preventDefault();
    scrollToSection(this.doc, this.ctaTarget());
  }
}
