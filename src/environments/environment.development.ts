declare global {
  interface Window {
    __env?: {
      apiUrl?: string;
    };
  }
}

export const environment = {
  production: false,
  apiUrl: (typeof window !== 'undefined' && window.__env?.apiUrl) || 'http://localhost:8081'
};
