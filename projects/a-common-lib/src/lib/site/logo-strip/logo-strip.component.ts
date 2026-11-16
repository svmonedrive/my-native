import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { RevealDirective } from '../reveal.directive';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

/** Strip of partner / supporter names (swap for logos later). Give the element an `id` to anchor it. */
@Component({
  selector: 'lib-logo-strip',
  imports: [TranslatePipe, SectionHeadingComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logo-strip.component.html',
  styleUrl: './logo-strip.component.scss',
})
export class LogoStripComponent {
  readonly titleKey = input.required<string>();
  readonly subtitleKey = input<string>();
  /** Translation keys of the partner names. */
  readonly nameKeys = input.required<readonly string[]>();
}
