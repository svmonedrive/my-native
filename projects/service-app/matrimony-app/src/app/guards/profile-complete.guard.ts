import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'a-common-lib';
import { UsersService } from '../services/users';

/** Members who have not finished their profile are sent to the profile page. Use after `authGuard()`. */
export const profileCompleteGuard: CanActivateFn = async () => {
  const { auth } = inject(AuthService);
  const users = inject(UsersService);
  const router = inject(Router); // inject before any await
  await auth.authStateReady();
  if (!auth.currentUser) return true; // authGuard handles guests
  const userDoc = await users.load(auth.currentUser);
  return userDoc.profileCompleted ? true : router.createUrlTree(['/profile-page']);
};
