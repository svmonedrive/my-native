import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';
import type { ResolvedServiceApp } from '../../service-catalog/service-catalog';
import { RevealDirective } from '../reveal.directive';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

/** Grid of service-app cards (name, description, link). Give the element `id="services"` to anchor it. */
@Component({
  selector: 'lib-services-section',
  imports: [TranslatePipe, SectionHeadingComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './services-section.component.html',
  styleUrl: './services-section.component.scss',
})
export class ServicesSectionComponent {
  readonly titleKey = input.required<string>();
  readonly subtitleKey = input<string>();
  readonly services = input.required<readonly ResolvedServiceApp[]>();
}
