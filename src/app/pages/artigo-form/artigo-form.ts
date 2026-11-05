import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArtigoService } from '../../core/services/artigo.service';
import { ArtigoRequest } from '../../core/models/artigo.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-artigo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './artigo-form.html',
  styleUrl: './artigo-form.css'
})
export class ArtigoFormComponent implements OnInit, AfterViewInit {

  editando = false;
  artigoId?: number;
  loading = false;
  error = '';
  doiBuscando = false;

  partesPlanta = [
    { label: 'Casca', icone: 'texture' },
    { label: 'Folhas', icone: 'energy_savings_leaf' },
    { label: 'Ramos', icone: 'device_hub' },
    { label: 'Frutos', icone: 'nutrition' },
    { label: 'Sementes', icone: 'grain' },
    { label: 'Raiz', icone: 'spa' },
    { label: 'Madeira / Cerne', icone: 'park' },
    { label: 'Flores', icone: 'local_florist' }
  ];

  estacoes = [
    { valor: 'Verão', subtitulo: 'Estação Úmida', icone: 'wb_sunny' },
    { valor: 'Outono', subtitulo: 'Transição Seca', icone: 'nest_cam_floodlight' },
    { valor: 'Inverno', subtitulo: 'Estio Crítico', icone: 'ac_unit' },
    { valor: 'Primavera', subtitulo: 'Brotamento', icone: 'filter_vintage' }
  ];

  metodologias = [
    'Butanol-HCl / Vanilina-HCl (Taninos Condensados - Método de Porter)',
    'Espectrofotometria Folin-Ciocalteu (Fenólicos Totais)',
    'Precipitação com Proteína (Afinidade com Albumina - BSA)',
    'Cromatografia Líquida de Alta Eficiência (HPLC-DAD / LC-MS)',
    'Ensaio de Rodanina (Taninos Hidrolisáveis - Galotaninos)',
    'Azul da Prússia (Compostos Polifenólicos Totais)',
    'Outro protocolo espectrométrico validado'
  ];

  artigo: ArtigoRequest = {
    titulo: '',
    link: '',
    fenolicos: 0,
    taninos: 0,
    metodologia: this.metodologias[0],
    tipoExtracao: 'Extração a Frio (T ≤ 25°C)',
    especie: '',
    local: '',
    partePlanta: 'Casca',
    estacao: 'Inverno',
    tcondensados: 0,
    thidrolisaveis: 0,
    latitude: -19.2341,
    longitude: -43.5389
  };

  private miniMap?: L.Map;
  private miniMarker?: L.Marker;

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
      this.carregarArtigo(this.artigoId);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.iniciarMinimapa();
    }, 200);
  }

  private carregarArtigo(id: number): void {
    this.loading = true;
    this.artigoService.buscarPorId(id).subscribe({
      next: (data) => {
        this.artigo = {
          titulo: data.titulo || '',
          link: data.link || '',
          fenolicos: data.fenolicos ?? 0,
          taninos: data.taninos ?? 0,
          metodologia: data.metodologia || this.metodologias[0],
          tipoExtracao: data.tipoExtracao || 'Extração a Frio (T ≤ 25°C)',
          especie: data.especie || '',
          local: data.local || '',
          partePlanta: data.partePlanta || 'Casca',
          estacao: data.estacao || 'Inverno',
          tcondensados: data.tcondensados ?? data.tCondensados ?? 0,
          thidrolisaveis: data.thidrolisaveis ?? data.tHidrolisaveis ?? 0,
          latitude: data.latitude ?? -19.2341,
          longitude: data.longitude ?? -43.5389
        };
        this.loading = false;
        this.cdr.detectChanges();
        this.atualizarPontoMinimapa();
      },
      error: () => {
        this.error = 'Erro ao carregar dados do artigo.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private iniciarMinimapa(): void {
    const container = document.getElementById('minimap');
    if (!container || this.miniMap) return;

    const lat = this.artigo.latitude ?? -19.2341;
    const lng = this.artigo.longitude ?? -43.5389;

    this.miniMap = L.map('minimap').setView([lat, lng], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.miniMap);

    this.miniMarker = L.marker([lat, lng], { draggable: true }).addTo(this.miniMap);

    this.miniMarker.on('dragend', (event) => {
      const pos = event.target.getLatLng();
      this.atualizarCoordenadas(pos.lat, pos.lng);
    });

    this.miniMap.on('click', (event: L.LeafletMouseEvent) => {
      this.atualizarCoordenadas(event.latlng.lat, event.latlng.lng);
    });
  }

  private atualizarPontoMinimapa(): void {
    if (!this.miniMap || !this.miniMarker) return;
    const lat = this.artigo.latitude ?? -19.2341;
    const lng = this.artigo.longitude ?? -43.5389;
    this.miniMarker.setLatLng([lat, lng]);
    this.miniMap.panTo([lat, lng]);
  }

  atualizarCoordenadas(lat: number, lng: number): void {
    this.artigo.latitude = parseFloat(lat.toFixed(6));
    this.artigo.longitude = parseFloat(lng.toFixed(6));
    if (this.miniMarker) {
      this.miniMarker.setLatLng([this.artigo.latitude, this.artigo.longitude]);
    }
    this.cdr.detectChanges();
  }

  obterGpsAtual(): void {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.atualizarCoordenadas(pos.coords.latitude, pos.coords.longitude);
        if (this.miniMap) {
          this.miniMap.setView([pos.coords.latitude, pos.coords.longitude], 12);
        }
      },
      () => {
        alert('Não foi possível obter a localização GPS atual.');
      }
    );
  }

  // Cálculos dinâmicos da proporção de taninos (Métricas Fitoquímicas)
  get pctCondensados(): number {
    const tc = Number(this.artigo.tcondensados) || 0;
    const th = Number(this.artigo.thidrolisaveis) || 0;
    const total = tc + th;
    if (total <= 0) return 50;
    return Math.round((tc / total) * 100);
  }

  get pctHidrolisaveis(): number {
    const tc = Number(this.artigo.tcondensados) || 0;
    const th = Number(this.artigo.thidrolisaveis) || 0;
    const total = tc + th;
    if (total <= 0) return 50;
    return Math.round((th / total) * 100);
  }

  get proporcaoBadge(): string {
    const tc = Number(this.artigo.tcondensados) || 0;
    const th = Number(this.artigo.thidrolisaveis) || 0;
    const total = tc + th;
    if (total <= 0) return '0% vs 0%';
    return `${this.pctCondensados}% vs ${this.pctHidrolisaveis}%`;
  }

  // Simulação amigável de preenchimento via DOI
  buscarDoi(): void {
    if (!this.artigo.link || this.artigo.link.trim() === '') {
      alert('Por favor, informe o DOI ou link no campo correspondente.');
      return;
    }

    this.doiBuscando = true;
    setTimeout(() => {
      this.artigo.titulo = 'Determinação de taninos condensados na casca de Mimosa tenuiflora sob regimes sazonais no semiárido';
      this.artigo.especie = 'Mimosa tenuiflora (Willd.) Poir.';
      this.artigo.local = 'Caicó - RN';
      this.artigo.latitude = -6.4589;
      this.artigo.longitude = -37.0989;
      this.artigo.fenolicos = 18.4;
      this.artigo.taninos = 12.6;
      this.artigo.tcondensados = 9.8;
      this.artigo.thidrolisaveis = 2.8;
      this.atualizarPontoMinimapa();
      this.doiBuscando = false;
      this.cdr.detectChanges();
    }, 600);
  }

  salvar(): void {
    if (!this.artigo.titulo.trim() || !this.artigo.especie.trim()) {
      this.error = 'Por favor, preencha o Título e a Espécie botânica.';
      return;
    }

    this.loading = true;
    this.error = '';

    const tc = Number(this.artigo.tcondensados) || 0;
    const th = Number(this.artigo.thidrolisaveis) || 0;

    const payload: ArtigoRequest = {
      ...this.artigo,
      fenolicos: Number(this.artigo.fenolicos) || 0,
      taninos: Number(this.artigo.taninos) || 0,
      tcondensados: tc,
      thidrolisaveis: th,
      tCondensados: tc,
      tHidrolisaveis: th,
      latitude: Number(this.artigo.latitude) || undefined,
      longitude: Number(this.artigo.longitude) || undefined
    };

    const requisicao = this.editando
      ? this.artigoService.atualizar(this.artigoId!, payload)
      : this.artigoService.salvar(payload);

    requisicao.subscribe({
      next: () => {
        this.router.navigate(['/artigos']);
      },
      error: (err) => {
        console.error('Erro ao salvar artigo:', err);
        this.error = 'Erro ao salvar o registro científico. Verifique sua autenticação.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/artigos']);
  }
}
