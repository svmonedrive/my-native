import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';

/** Title + optional subtitle with an accent underline. Used by every content section. */
@Component({
  selector: 'lib-section-heading',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './section-heading.component.html',
  styleUrl: './section-heading.component.scss',
})
export class SectionHeadingComponent {
  readonly titleKey = input.required<string>();
  readonly subtitleKey = input<string>();
}
