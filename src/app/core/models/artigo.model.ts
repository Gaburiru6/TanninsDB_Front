export interface ArtigoRequest {
  titulo: string;
  link: string;
  fenolicos: number;
  taninos: number;
  metodologia: string;
  tipoExtracao: string;
  especie: string;
  local: string;
  partePlanta: string;
  estacao: string;
  tcondensados: number;
  thidrolisaveis: number;
}

export interface ArtigoResponse extends ArtigoRequest {
  id: number;
  status: string;
  nomeAutor: string;
}