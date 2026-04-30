import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArtigoService } from '../../core/services/artigo.service';
import { ArtigoRequest } from '../../core/models/artigo.model';

@Component({
  selector: 'app-artigo-form',
  standalone: true,
  imports: [FormsModule],
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

  salvar(): void {
    this.loading = true;
    const operacao = this.editando
      ? this.artigoService.atualizar(this.artigoId!, this.artigo)
      : this.artigoService.salvar(this.artigo);

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