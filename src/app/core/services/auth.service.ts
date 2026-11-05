import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  loginWithOrcid(): void {
    window.location.href = `${this.apiUrl}/auth/orcid`;
  }

  handleCallback(code: string) {
    return this.http.get<AuthResponse>(`${this.apiUrl}/auth/orcid/callback?code=${code}`);
  }

  devLogin() {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/dev`, {});
  }

  saveToken(response: AuthResponse): void {
    localStorage.setItem('token', response.access_token);
    if (response.name) localStorage.setItem('name', response.name);
    if (response.orcid) localStorage.setItem('orcid', response.orcid);
    if (response.role) localStorage.setItem('role', response.role);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getName(): string | null {
    return localStorage.getItem('name');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/artigos']);
  }
}