import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent, resolveServiceApps, TranslatePipe } from 'a-common-lib';

import { KAKDWIP_CATALOG } from './app-catalog';

@Component({
  imports: [RouterOutlet, AppShellComponent, TranslatePipe],
  selector: 'app-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly apps = resolveServiceApps(KAKDWIP_CATALOG);
}
