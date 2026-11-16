import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '../i18n/translate.pipe';
import { PreferencesComponent } from '../preferences/preferences.component';

/**
 * Common page frame for every app: coloured header (title + preferences) and a content slot.
 * `<lib-app-shell titleKey="app.title"> ...page... </lib-app-shell>`
 */
@Component({
  selector: 'lib-app-shell',
  imports: [PreferencesComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  readonly titleKey = input.required<string>();
}
