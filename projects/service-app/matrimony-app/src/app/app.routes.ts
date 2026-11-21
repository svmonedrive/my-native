import { Routes } from '@angular/router';
import { authGuard } from 'a-common-lib';
import { profileCompleteGuard } from './guards';
import { HomePageComponent } from './pages/home-page';
import { LoginPageComponent } from './pages/login-page';
import { ProfilePageComponent } from './pages/profile-page';

export const routes: Routes = [
  { path: 'login-page', component: LoginPageComponent },
  { path: 'profile-page', component: ProfilePageComponent, canActivate: [authGuard()] },
  { path: 'home-page', component: HomePageComponent, canActivate: [authGuard(), profileCompleteGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'home-page' },
  { path: '**', redirectTo: 'home-page' },
];
