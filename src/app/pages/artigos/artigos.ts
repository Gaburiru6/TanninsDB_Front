import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ArtigoService } from '../../core/services/artigo.service';
import { ArtigoResponse } from '../../core/models/artigo.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-artigos',
  standalone: true,
  imports: [],
  templateUrl: './artigos.html',
  styleUrl: './artigos.css'
})
export class ArtigosComponent implements OnInit {

  artigos: ArtigoResponse[] = [];
  loading = true;
  error = '';

  constructor(
    private artigoService: ArtigoService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarArtigos();
  }

  carregarArtigos(): void {
    this.loading = true;
    this.artigoService.listar().subscribe({
      next: (data) => {
        this.artigos = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('erro ao listar:', err);
        this.error = 'Erro ao carregar artigos.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  novo(): void {
    this.router.navigate(['/artigos/novo']);
  }

  editar(id: number): void {
    this.router.navigate(['/artigos/editar', id]);
  }

  remover(id: number): void {
    if (confirm('Deseja remover este artigo?')) {
      this.artigoService.remover(id).subscribe({
        next: () => this.carregarArtigos(),
        error: () => {
          this.error = 'Erro ao remover artigo.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  get nomeUsuario(): string {
    return this.authService.getName() || '';
  }
}