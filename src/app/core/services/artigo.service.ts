import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ArtigoRequest, ArtigoResponse } from '../models/artigo.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArtigoService {

  private apiUrl = `${environment.apiUrl}/api/artigos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<ArtigoResponse[]> {
    return this.http.get<ArtigoResponse[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<ArtigoResponse> {
    return this.http.get<ArtigoResponse>(`${this.apiUrl}/${id}`);
  }

  salvar(artigo: ArtigoRequest): Observable<ArtigoResponse> {
    return this.http.post<ArtigoResponse>(this.apiUrl, artigo);
  }

  atualizar(id: number, artigo: ArtigoRequest): Observable<ArtigoResponse> {
    return this.http.put<ArtigoResponse>(`${this.apiUrl}/${id}`, artigo);
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}