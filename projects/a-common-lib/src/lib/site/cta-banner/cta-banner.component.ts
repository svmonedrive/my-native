import { ChangeDetectionStrategy, Component, DOCUMENT, inject, input } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { RevealDirective } from '../reveal.directive';
import { scrollToSection } from '../scroll';

/** Full-width call-to-action band with one button. */
@Component({
  selector: 'lib-cta-banner',
  imports: [TranslatePipe, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cta-banner.component.html',
  styleUrl: './cta-banner.component.scss',
})
export class CtaBannerComponent {
  readonly titleKey = input.required<string>();
  readonly textKey = input<string>();
  readonly ctaKey = input.required<string>();
  /** `id` of the section the button scrolls to. */
  readonly target = input.required<string>();

  private readonly doc = inject(DOCUMENT);

  protected go(event: Event): void {
    event.preventDefault();
    scrollToSection(this.doc, this.target());
  }
}
