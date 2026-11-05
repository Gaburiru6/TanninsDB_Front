# ========================================================
# Estágio 1: Build da aplicação Angular com Node.js
# ========================================================
FROM node:22-alpine AS builder
WORKDIR /app

# Argumento opcional no build (se não informado, usa o padrão)
ARG API_URL="https://tanninsapi.murasaki.sbs"
ENV API_URL=${API_URL}

# Copia dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN npm ci || npm install

# Copia código-fonte e executa build de produção
COPY . .
RUN npm run build --configuration=production

# ========================================================
# Estágio 2: Servidor Web Nginx de alta performance
# ========================================================
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Variável de ambiente em tempo de execução (sobrescrita pelo .env no docker-compose)
ENV API_URL="https://tanninsapi.murasaki.sbs"

# Limpa arquivos padrão do Nginx
RUN rm -rf ./*

# Copia o build de produção do Angular
COPY --from=builder /app/dist/tanninsdb-front/browser ./

# Copia a configuração customizada do Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe porta do Nginx
EXPOSE 80

# No arranque do container, gera dinamicamente o env.js a partir do .env e inicia o Nginx
CMD ["/bin/sh", "-c", "echo \"window.__env = { apiUrl: '${API_URL}' };\" > /usr/share/nginx/html/env.js && exec nginx -g 'daemon off;'"]
