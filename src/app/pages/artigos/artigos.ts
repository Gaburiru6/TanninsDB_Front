import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArtigoService } from '../../core/services/artigo.service';
import { ArtigoResponse } from '../../core/models/artigo.model';
import { AuthService } from '../../core/services/auth.service';
import * as L from 'leaflet';

const iconDefault = L.icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-artigos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './artigos.html',
  styleUrl: './artigos.css'
})
export class ArtigosComponent implements OnInit, AfterViewInit {

  artigos: ArtigoResponse[] = [];
  artigosFiltrados: ArtigoResponse[] = [];
  loading = true;
  error = '';

  // Filtros
  filtroTexto = '';
  filtroEstacao = '';
  filtroStatus = '';

  private map?: L.Map;
  private markersLayer = L.layerGroup();

  constructor(
    private artigoService: ArtigoService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarArtigos();
  }

  ngAfterViewInit(): void {
    this.iniciarMapa();
  }

  private iniciarMapa(): void {
    if (this.map) return;

    // Centro aproximado do Brasil
    this.map = L.map('map').setView([-14.235, -51.925], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);

    // Se os artigos já foram carregados antes do mapa, plota agora
    if (this.artigos.length > 0) {
      this.plotarArtigosNoMapa();
    }
  }

  carregarArtigos(): void {
    this.loading = true;
    this.artigoService.listar().subscribe({
      next: (data) => {
        this.artigos = data;
        this.aplicarFiltros();
        this.loading = false;
        this.cdr.detectChanges();
        if (this.map) {
          this.plotarArtigosNoMapa();
        }
      },
      error: (err) => {
        console.error('Erro ao listar artigos:', err);
        this.error = 'Erro ao carregar artigos científicos do servidor.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.artigos];

    if (this.filtroTexto.trim()) {
      const termo = this.filtroTexto.toLowerCase();
      resultado = resultado.filter(a =>
        (a.titulo && a.titulo.toLowerCase().includes(termo)) ||
        (a.especie && a.especie.toLowerCase().includes(termo)) ||
        (a.local && a.local.toLowerCase().includes(termo)) ||
        (a.metodologia && a.metodologia.toLowerCase().includes(termo))
      );
    }

    if (this.filtroEstacao) {
      resultado = resultado.filter(a => a.estacao === this.filtroEstacao);
    }

    if (this.filtroStatus) {
      resultado = resultado.filter(a => a.status === this.filtroStatus);
    }

    this.artigosFiltrados = resultado;
    this.plotarArtigosNoMapa();
  }

  limparFiltros(): void {
    this.filtroTexto = '';
    this.filtroEstacao = '';
    this.filtroStatus = '';
    this.aplicarFiltros();
  }

  private plotarArtigosNoMapa(): void {
    if (!this.map) return;

    this.markersLayer.clearLayers();
    const bounds: L.LatLngExpression[] = [];

    for (const artigo of this.artigosFiltrados) {
      let lat = artigo.latitude;
      let lon = artigo.longitude;

      // Se o artigo não possui latitude/longitude gravadas, tenta coordenadas de fallback por local conhecido
      if (lat === undefined || lat === null || lon === undefined || lon === null) {
        const fallback = this.obterCoordenadasFallback(artigo.local);
        if (fallback) {
          lat = fallback.lat;
          lon = fallback.lon;
        }
      }

      if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
        bounds.push([lat, lon]);

        const marker = L.marker([lat, lon]).addTo(this.markersLayer);
        const popupContent = `
          <div style="font-family: 'Nunito Sans', sans-serif; font-size: 13px; line-height: 1.4; min-width: 200px;">
            <div style="color: #4a7c59; font-weight: bold; font-size: 11px; text-transform: uppercase;">
              ${artigo.local || 'Local de Coleta'}
            </div>
            <strong style="font-size: 14px; font-family: 'Literata', serif; display: block; margin: 3px 0; color: #2e3230;">
              <em>${artigo.especie}</em>
            </strong>
            <div style="font-size: 12px; color: #4a4e4a; margin-bottom: 6px;">
              ${artigo.titulo}
            </div>
            <div style="background: #f0ece4; padding: 6px 8px; border-radius: 8px; font-size: 11px; margin-bottom: 6px;">
              <div><strong>Taninos:</strong> ${artigo.taninos ?? '-'} %</div>
              <div><strong>Fenólicos:</strong> ${artigo.fenolicos ?? '-'} %</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
              <span style="padding: 2px 6px; border-radius: 4px; font-weight: bold; background: ${artigo.status === 'APROVADO' ? '#d8f0de' : '#f0e8db'}; color: ${artigo.status === 'APROVADO' ? '#2a6038' : '#705c30'};">
                ${artigo.status}
              </span>
              <a href="${artigo.link}" target="_blank" style="color: #4a7c59; font-weight: bold; text-decoration: none;">Ver DOI &rarr;</a>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
      }
    }

    if (bounds.length > 0 && this.map) {
      // Ajusta o zoom para enquadrar os marcadores
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }

  // Fallback rápido sem requisição de rede para registros antigos
  private obterCoordenadasFallback(local?: string): { lat: number; lon: number } | null {
    if (!local) return null;
    const l = local.toLowerCase();
    if (l.includes('macaiba') || l.includes('macaíba') || l.includes('eaj')) return { lat: -5.8584, lon: -35.3539 };
    if (l.includes('natal') || l.includes('ufrn')) return { lat: -5.7945, lon: -35.2110 };
    if (l.includes('caicó') || l.includes('caico')) return { lat: -6.4589, lon: -37.0989 };
    if (l.includes('serra do cipó') || l.includes('cipo') || l.includes('minas')) return { lat: -19.2341, lon: -43.5389 };
    if (l.includes('ceara') || l.includes('ceará') || l.includes('fortaleza')) return { lat: -3.7319, lon: -38.5267 };
    if (l.includes('cerrado') || l.includes('goiás') || l.includes('goias') || l.includes('brasilia')) return { lat: -15.7975, lon: -47.8919 };
    if (l.includes('bahia') || l.includes('salvador')) return { lat: -12.9777, lon: -38.5016 };
    return null;
  }

  // Métricas para os Cards de Estatísticas
  get totalArtigos(): number {
    return this.artigos.length;
  }

  get totalEspecies(): number {
    return new Set(this.artigos.map(a => a.especie).filter(Boolean)).size;
  }

  get totalLocais(): number {
    return new Set(this.artigos.map(a => a.local).filter(Boolean)).size;
  }

  get totalMetodologias(): number {
    return new Set(this.artigos.map(a => a.metodologia).filter(Boolean)).size;
  }

  novo(): void {
    this.router.navigate(['/artigos/novo']);
  }

  editar(id: number): void {
    this.router.navigate(['/artigos/editar', id]);
  }

  remover(id: number): void {
    if (confirm('Deseja realmente remover este registro científico?')) {
      this.artigoService.remover(id).subscribe({
        next: () => {
          this.artigos = this.artigos.filter(a => a.id !== id);
          this.aplicarFiltros();
        },
        error: () => {
          this.error = 'Erro ao remover artigo. Verifique suas permissões.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout();
    this.cdr.detectChanges();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get nomeUsuario(): string {
    return this.authService.getName() || 'Pesquisador';
  }

  get userRole(): string {
    return this.authService.getRole() || 'PESQUISADOR';
  }
}
