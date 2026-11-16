import { ChangeDetectionStrategy, Component, DOCUMENT, inject, input } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { RevealDirective } from '../reveal.directive';
import { scrollToSection } from '../scroll';

/** Full-screen intro with a headline and one call-to-action. Give the element `id="home"` to anchor it. */
@Component({
  selector: 'lib-hero-section',
  imports: [TranslatePipe, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent {
  readonly titleKey = input.required<string>();
  readonly subtitleKey = input.required<string>();
  readonly ctaKey = input.required<string>();
  /** `id` of the section the button scrolls to. */
  readonly ctaTarget = input.required<string>();

  private readonly doc = inject(DOCUMENT);

  protected go(event: Event): void {
    event.preventDefault();
    scrollToSection(this.doc, this.ctaTarget());
  }
}
