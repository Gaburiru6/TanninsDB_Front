import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { ArtigosComponent } from './pages/artigos/artigos';
import { ArtigoFormComponent } from './pages/artigo-form/artigo-form';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  console.log('token:', auth.getToken());
  if (auth.isLoggedIn()) return true;
  return router.navigate(['/login']);
};

export const routes: Routes = [
  { path: '', redirectTo: 'artigos', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'auth/callback', component: LoginComponent },
  { path: 'artigos', component: ArtigosComponent, canActivate: [authGuard] },
  { path: 'artigos/novo', component: ArtigoFormComponent, canActivate: [authGuard] },
  { path: 'artigos/editar/:id', component: ArtigoFormComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'artigos' }
];

