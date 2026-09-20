import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
  imports: [],
  templateUrl: './artigos.html',
  styleUrl: './artigos.css'
})
export class ArtigosComponent implements OnInit, AfterViewInit {

  artigos: ArtigoResponse[] = [];
  loading = true;
  error = '';
  
  private map!: L.Map;
  // Cache para não buscar a mesma cidade várias vezes na API gratuita
  private geocodingCache = new Map<string, {lat: number, lon: number}>();

  constructor(
    private artigoService: ArtigoService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarArtigos();
  }

  // O mapa só pode ser criado DEPOIS que o HTML (a view) estiver carregado
  ngAfterViewInit(): void {
    this.iniciarMapa();
  }

  private iniciarMapa(): void {
    this.map = L.map('map').setView([-14.235, -51.925], 4); // Centro do Brasil por padrão

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  carregarArtigos(): void {
    this.loading = true;
    this.artigoService.listar().subscribe({
      next: (data) => {
        this.artigos = data;
        this.loading = false;
        this.cdr.detectChanges();
        this.plotarArtigosNoMapa();
      },
      error: (err) => {
        console.log('erro ao listar:', err);
        this.error = 'Erro ao carregar artigos.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private async plotarArtigosNoMapa() {
    for (const artigo of this.artigos) {
      if (artigo.local && artigo.local.trim() !== '') {
        const coords = await this.buscarCoordenadas(artigo.local);
        
        if (coords) {
          L.marker([coords.lat, coords.lon])
            .addTo(this.map)
            .bindPopup(`
              <div style="font-size: 14px;">
                <strong>${artigo.titulo}</strong><br>
                <em>${artigo.especie}</em><br>
                📍 ${artigo.local}
              </div>
            `);
        }
      }
    }
  }

  // Função para transformar texto (ex: "Natal, RN") em Latitude/Longitude
  private async buscarCoordenadas(local: string): Promise<{lat: number, lon: number} | null> {
    if (this.geocodingCache.has(local)) {
      return this.geocodingCache.get(local)!;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(local)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        this.geocodingCache.set(local, coords);
        
        // Espera 1 segundo para respeitar o limite da API gratuita do OpenStreetMap
        await new Promise(resolve => setTimeout(resolve, 1000));
        return coords;
      }
    } catch (err) {
      console.error('Erro ao buscar localização de:', local, err);
    }
    
    return null;
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
        next: () => {
          // Limpa os pinos atuais e recarrega tudo
          this.map.eachLayer((layer) => {
            if (layer instanceof L.Marker) { this.map.removeLayer(layer); }
          });
          this.carregarArtigos();
        },
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