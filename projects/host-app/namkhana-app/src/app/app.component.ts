import { Component, DOCUMENT, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  ActionTilesComponent,
  CardGridComponent,
  ContactFormComponent,
  ContactFormValue,
  CtaBannerComponent,
  HeroSectionComponent,
  I18nService,
  LogoStripComponent,
  resolveServiceApps,
  ServicesSectionComponent,
  SiteHeaderComponent,
  SiteLink,
  TranslatePipe,
} from 'a-common-lib';

import { NAMKHANA_CATALOG } from './app-catalog';
import { ACTION_TILES, CONTACT_EMAIL, PARTNERS, STORIES } from './app.content';

@Component({
  imports: [
    RouterOutlet,
    SiteHeaderComponent,
    HeroSectionComponent,
    ActionTilesComponent,
    ServicesSectionComponent,
    LogoStripComponent,
    CardGridComponent,
    CtaBannerComponent,
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
    { id: 'involved', labelKey: 'nav.involved' },
    { id: 'services', labelKey: 'nav.services' },
    { id: 'stories', labelKey: 'nav.stories' },
    { id: 'contact', labelKey: 'nav.contact' },
  ];
  protected readonly apps = resolveServiceApps(NAMKHANA_CATALOG);
  protected readonly tiles = ACTION_TILES;
  protected readonly partners = PARTNERS;
  protected readonly stories = STORIES;
  protected readonly year = new Date().getFullYear();

  /** No backend yet: open the visitor's mail client with the message filled in. */
  protected onContact(form: ContactFormValue): void {
    const subject = `${this.i18n.t('app.title')} - ${form.name}`;
    const body = [form.message, '', `${form.name} <${form.email}>`, form.phone].filter(Boolean).join('\n');
    const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    this.doc.defaultView?.location.assign(url);
  }
}
