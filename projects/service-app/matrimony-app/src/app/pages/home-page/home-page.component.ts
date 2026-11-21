import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'a-common-lib';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected async logout() {
    await this.auth.signOut();
    this.router.navigate(['/login-page']);
  }
}
