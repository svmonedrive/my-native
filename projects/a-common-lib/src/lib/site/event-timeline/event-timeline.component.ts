import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { I18nService, Lang } from '../../i18n/i18n.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { RevealDirective } from '../reveal.directive';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

export interface TimelineEvent {
  /** ISO date, e.g. `2026-12-12`. Shown in the visitor's language. */
  date: string;
  titleKey: string;
  descriptionKey: string;
}

const LOCALES: Record<Lang, string> = { en: 'en-IN', bn: 'bn-IN', hi: 'hi-IN' };

/** Vertical timeline of events. Give the element `id="events"` to anchor it. */
@Component({
  selector: 'lib-event-timeline',
  imports: [TranslatePipe, SectionHeadingComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-timeline.component.html',
  styleUrl: './event-timeline.component.scss',
})
export class EventTimelineComponent {
  readonly titleKey = input.required<string>();
  readonly subtitleKey = input<string>();
  readonly events = input.required<readonly TimelineEvent[]>();

  private readonly i18n = inject(I18nService);

  protected formatDate(iso: string): string {
    const date = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat(LOCALES[this.i18n.lang()], {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }
}
