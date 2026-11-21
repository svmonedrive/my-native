import { Routes } from '@angular/router';
import { authGuard } from 'a-common-lib';
import { HomePageComponent } from './pages/home-page';
import { LoginPageComponent } from './pages/login-page';

export const routes: Routes = [
  { path: 'login-page', component: LoginPageComponent },
  { path: 'home-page', component: HomePageComponent, canActivate: [authGuard()] },
  { path: '', pathMatch: 'full', redirectTo: 'home-page' },
  { path: '**', redirectTo: 'home-page' },
];
