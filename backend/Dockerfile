FROM node:20-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código
COPY . .

# Build
RUN npm run build

# Expor porta
EXPOSE 3001

# Comando padrão
CMD ["npm", "start"]



