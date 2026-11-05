# ========================================================
# Estágio 1: Build da aplicação Angular com Node.js
# ========================================================
FROM node:22-alpine AS builder
WORKDIR /app

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

# Limpa arquivos padrão do Nginx
RUN rm -rf ./*

# Copia o build de produção do Angular
COPY --from=builder /app/dist/tanninsdb-front/browser ./

# Copia a configuração customizada do Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe porta do Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
