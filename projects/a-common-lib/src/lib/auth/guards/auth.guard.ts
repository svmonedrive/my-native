import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service';

/**
 * Lets signed-in users through; everyone else is redirected to `loginPath`.
 * Usage: `{ path: 'home-page', component: ..., canActivate: [authGuard()] }`
 */
export const authGuard =
  (loginPath = '/login-page'): CanActivateFn =>
  async () => {
    const { auth } = inject(AuthService);
    const router = inject(Router); // inject before any await
    await auth.authStateReady();
    return auth.currentUser ? true : router.createUrlTree([loginPath]);
  };
