import { Component, DOCUMENT, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  ContactFormComponent,
  ContactFormValue,
  EventTimelineComponent,
  HeroSectionComponent,
  I18nService,
  MapSectionComponent,
  resolveServiceApps,
  ServicesSectionComponent,
  SiteHeaderComponent,
  SiteLink,
  TranslatePipe,
} from 'a-common-lib';

import { KAKDWIP_CATALOG } from './app-catalog';
import { CONTACT_EMAIL, EVENTS, LOCATION } from './app.content';

@Component({
  imports: [
    RouterOutlet,
    SiteHeaderComponent,
    HeroSectionComponent,
    ServicesSectionComponent,
    EventTimelineComponent,
    MapSectionComponent,
    ContactFormComponent,
    TranslatePipe,
  ],
  selector: 'app-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly doc = inject(DOCUMENT);
  private readonly i18n = inject(I18nService);

  protected readonly links: SiteLink[] = [
    { id: 'home', labelKey: 'nav.home' },
    { id: 'services', labelKey: 'nav.services' },
    { id: 'events', labelKey: 'nav.events' },
    { id: 'location', labelKey: 'nav.location' },
    { id: 'contact', labelKey: 'nav.contact' },
  ];
  protected readonly apps = resolveServiceApps(KAKDWIP_CATALOG);
  protected readonly events = EVENTS;
  protected readonly location = LOCATION;
  protected readonly year = new Date().getFullYear();

  /** No backend yet: open the visitor's mail client with the message filled in. */
  protected onContact(form: ContactFormValue): void {
    const subject = `${this.i18n.t('app.title')} - ${form.name}`;
    const body = [form.message, '', `${form.name} <${form.email}>`, form.phone].filter(Boolean).join('\n');
    const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    this.doc.defaultView?.location.assign(url);
  }
}
