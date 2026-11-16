import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService, Lang } from '../i18n/i18n.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { ThemeService } from '../theme/theme.service';

/** Language picker + light/dark toggle. Used by the shell, can also be placed on its own. */
@Component({
  selector: 'lib-preferences',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.scss',
})
export class PreferencesComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly theme = inject(ThemeService);

  protected onLang(event: Event): void {
    this.i18n.setLang((event.target as HTMLSelectElement).value as Lang);
  }
}
