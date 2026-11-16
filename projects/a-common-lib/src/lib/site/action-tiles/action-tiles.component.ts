import { ChangeDetectionStrategy, Component, DOCUMENT, inject, input } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { RevealDirective } from '../reveal.directive';
import { scrollToSection } from '../scroll';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

export interface ActionTile {
  /** Short symbol shown above the label (an emoji works well). */
  icon: string;
  labelKey: string;
  textKey: string;
  /** `id` of the section the tile scrolls to. */
  target: string;
}

/** Row of large "get involved" tiles. Give the element `id="involved"` to anchor it. */
@Component({
  selector: 'lib-action-tiles',
  imports: [TranslatePipe, SectionHeadingComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './action-tiles.component.html',
  styleUrl: './action-tiles.component.scss',
})
export class ActionTilesComponent {
  readonly titleKey = input.required<string>();
  readonly subtitleKey = input<string>();
  readonly tiles = input.required<readonly ActionTile[]>();

  private readonly doc = inject(DOCUMENT);

  protected go(target: string, event: Event): void {
    event.preventDefault();
    scrollToSection(this.doc, target);
  }
}
