import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { RevealDirective } from '../reveal.directive';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

export interface InfoCard {
  titleKey: string;
  textKey: string;
  /** Small label above the title (category, date, ...). */
  tagKey?: string;
}

/** Grid of article / news cards with a coloured header band. Give the element an `id` to anchor it. */
@Component({
  selector: 'lib-card-grid',
  imports: [TranslatePipe, SectionHeadingComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-grid.component.html',
  styleUrl: './card-grid.component.scss',
})
export class CardGridComponent {
  readonly titleKey = input.required<string>();
  readonly subtitleKey = input<string>();
  readonly cards = input.required<readonly InfoCard[]>();
}
