import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArtigoService } from '../../core/services/artigo.service';
import { ArtigoRequest } from '../../core/models/artigo.model';

@Component({
  selector: 'app-artigo-form',
  standalone: true,
  imports: [CommonModule, FormsModule], // Adicionado CommonModule para o *ngIf do HTML funcionar
  templateUrl: './artigo-form.html',
  styleUrl: './artigo-form.css'
})
export class ArtigoFormComponent implements OnInit {

  editando = false;
  artigoId?: number;
  loading = false;
  error = '';

  artigo: ArtigoRequest = {
    titulo: '',
    link: '',
    fenolicos: 0,
    taninos: 0,
    metodologia: '',
    tipoExtracao: '',
    especie: '',
    local: '',
    partePlanta: '',
    estacao: '',
    tcondensados: 0,
    thidrolisaveis: 0
  };

  constructor(
    private artigoService: ArtigoService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editando = true;
      this.artigoId = +id;
      this.artigoService.buscarPorId(this.artigoId).subscribe({
        next: (data) => {
          this.artigo = {
            titulo: data.titulo,
            link: data.link,
            fenolicos: data.fenolicos,
            taninos: data.taninos,
            metodologia: data.metodologia,
            tipoExtracao: data.tipoExtracao,
            especie: data.especie,
            local: data.local,
            partePlanta: data.partePlanta,
            estacao: data.estacao,
            tcondensados: data.tcondensados,
            thidrolisaveis: data.thidrolisaveis
          };
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Erro ao carregar artigo.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  tratarNumero(campo: keyof ArtigoRequest, valor: string | number): void {
    if (valor === null || valor === undefined || valor === '') {
      (this.artigo as any)[campo] = 0;
      return;
    }
    
    if (typeof valor === 'string') {
      // Substitui vírgula por ponto e remove letras
      const valorFormatado = valor.replace(',', '.').replace(/[^0-9.]/g, '');
      (this.artigo as any)[campo] = valorFormatado;
    } else {
      (this.artigo as any)[campo] = valor;
    }
  }

  salvar(): void {
    this.loading = true;
    
    // Força a conversão para número (Double/Float) antes de enviar para evitar erros no backend
    const payloadParaSalvar: ArtigoRequest = {
      ...this.artigo,
      fenolicos: Number(this.artigo.fenolicos) || 0,
      taninos: Number(this.artigo.taninos) || 0,
      tcondensados: Number(this.artigo.tcondensados) || 0,
      thidrolisaveis: Number(this.artigo.thidrolisaveis) || 0
    };

    const operacao = this.editando
      ? this.artigoService.atualizar(this.artigoId!, payloadParaSalvar)
      : this.artigoService.salvar(payloadParaSalvar);

    operacao.subscribe({
      next: () => this.router.navigate(['/artigos']),
      error: () => {
        this.error = 'Erro ao salvar artigo.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/artigos']);
  }
}