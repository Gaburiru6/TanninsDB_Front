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

  saveToken(response: AuthResponse): void {
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('name', response.name);
    localStorage.setItem('orcid', response.orcid);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getName(): string | null {
    return localStorage.getItem('name');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}