import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {

  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      this.loading = true;
      this.authService.handleCallback(code).subscribe({
        next: (response) => {
          this.authService.saveToken(response);
          this.router.navigate(['/artigos']);
        },
        error: () => {
          this.error = 'Erro ao autenticar com ORCID. Tente novamente.';
          this.loading = false;
        }
      });
    }
  }

  login(): void {
    this.authService.loginWithOrcid();
  }

  loginDev(): void {
    this.loading = true;
    this.authService.devLogin().subscribe({
      next: (response) => {
        this.authService.saveToken(response);
        this.router.navigate(['/artigos']);
      },
      error: () => {
        this.error = 'Ambiente de desenvolvimento não disponível ou erro no servidor.';
        this.loading = false;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/artigos']);
  }
}