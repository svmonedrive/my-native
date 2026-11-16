import { Component } from '@angular/core';

import { resolveServiceApps } from 'a-common-lib';

import { KAKDWIP_CATALOG } from './app-catalog';

@Component({
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly apps = resolveServiceApps(KAKDWIP_CATALOG);
}
