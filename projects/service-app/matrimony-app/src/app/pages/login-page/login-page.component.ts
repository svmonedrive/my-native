import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from 'a-common-lib';

@Component({
  selector: 'app-login-page',
  imports: [LoginComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  private readonly router = inject(Router);

  protected onSignedIn() {
    this.router.navigate(['/home-page']);
  }
}
