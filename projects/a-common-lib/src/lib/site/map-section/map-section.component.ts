import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { RevealDirective } from '../reveal.directive';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

/** OpenStreetMap embed with a marker plus the address. Give the element `id="location"` to anchor it. */
@Component({
  selector: 'lib-map-section',
  imports: [TranslatePipe, SectionHeadingComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map-section.component.html',
  styleUrl: './map-section.component.scss',
})
export class MapSectionComponent {
  readonly titleKey = input.required<string>();
  readonly subtitleKey = input<string>();
  readonly addressKey = input.required<string>();
  readonly lat = input.required<number>();
  readonly lng = input.required<number>();

  private readonly sanitizer = inject(DomSanitizer);

  /** Built only from validated numbers, so it is safe to trust for the iframe. */
  protected readonly embedUrl = computed(() => {
    const lat = Number(this.lat());
    const lng = Number(this.lng());
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const bbox = [lng - 0.02, lat - 0.012, lng + 0.02, lat + 0.012].join(',');
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`,
    );
  });

  protected readonly linkUrl = computed(
    () => `https://www.openstreetmap.org/?mlat=${this.lat()}&mlon=${this.lng()}#map=15/${this.lat()}/${this.lng()}`,
  );
}
