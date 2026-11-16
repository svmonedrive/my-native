import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { appUrl, UTILITY_APPS } from './app-catalog';

@Component({
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly apps = UTILITY_APPS.map((app) => ({ ...app, url: appUrl(app) }));
}
