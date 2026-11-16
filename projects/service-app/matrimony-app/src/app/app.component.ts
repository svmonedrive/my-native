import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent, TranslatePipe } from 'a-common-lib';

@Component({
  imports: [RouterOutlet, AppShellComponent, TranslatePipe],
  selector: 'app-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly titleKey = 'service.matrimony.name';
}
