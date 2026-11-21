import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent } from 'a-common-lib';

@Component({
  imports: [RouterOutlet, AppShellComponent],
  selector: 'app-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly titleKey = 'service.matrimony.name';
}
