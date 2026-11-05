(function (window) {
  window.__env = window.__env || {};
  // Valor padrão para desenvolvimento local (sobrescrito em produção/dev pelo .env no Docker)
  window.__env.apiUrl = 'https://tanninsapi.murasaki.sbs';
}(this));
