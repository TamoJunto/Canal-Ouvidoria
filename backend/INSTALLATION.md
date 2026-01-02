# Guia de Instalação - Backend Canal de Ouvidoria

Este guia detalha o processo completo de instalação e configuração do backend.

## Requisitos do Sistema

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Docker**: >= 20.10 (recomendado)
- **Docker Compose**: >= 2.0 (recomendado)

### Ou, sem Docker:
- **PostgreSQL**: >= 16
- **Redis**: >= 7

## Instalação Completa (Docker - Recomendado)

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar ambiente

```bash
# Copiar arquivo de configuração
cp env.example .env

# Editar configurações (use seu editor favorito)
nano .env  # ou code .env
```

### 3. Gerar chaves JWT

```bash
# Criar diretório para chaves
mkdir -p keys

# Gerar par de chaves RSA
ssh-keygen -t rsa -b 4096 -m PEM -f keys/jwtRS256.key -N ""

# Extrair chave pública
openssl rsa -in keys/jwtRS256.key -pubout -outform PEM -out keys/jwtRS256.key.pub
```

### 4. Adicionar chaves ao .env

```bash
# Chave privada (remover quebras de linha)
echo "JWT_PRIVATE_KEY=\"$(awk '{printf "%s\\n", $0}' keys/jwtRS256.key)\"" >> .env

# Chave pública
echo "JWT_PUBLIC_KEY=\"$(awk '{printf "%s\\n", $0}' keys/jwtRS256.key.pub)\"" >> .env
```

### 5. Iniciar com Docker

```bash
# Iniciar todos os serviços (PostgreSQL + Redis + Backend)
docker-compose up -d

# Verificar se está rodando
docker-compose ps

# Ver logs
docker-compose logs -f backend
```

### 6. Verificar instalação

```bash
# Health check
curl http://localhost:3001/health

# Deve retornar:
# {
#   "success": true,
#   "service": "Canal de Ouvidoria API",
#   "version": "1.0.0",
#   ...
# }
```

## Instalação Manual (Sem Docker)

### 1. Instalar PostgreSQL

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql-16
```

#### macOS:
```bash
brew install postgresql@16
brew services start postgresql@16
```

#### Windows:
Baixe o instalador em https://www.postgresql.org/download/windows/

### 2. Configurar PostgreSQL

```bash
# Conectar ao PostgreSQL
sudo -u postgres psql

# Criar banco de dados
CREATE DATABASE canal_ouvidoria;

# Criar usuário
CREATE USER canal_user WITH ENCRYPTED PASSWORD 'sua_senha_segura';

# Dar permissões
GRANT ALL PRIVILEGES ON DATABASE canal_ouvidoria TO canal_user;

# Sair
\q
```

### 3. Executar schema

```bash
psql -U canal_user -d canal_ouvidoria -f init.sql
```

### 4. Instalar Redis

#### Ubuntu/Debian:
```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

#### macOS:
```bash
brew install redis
brew services start redis
```

#### Windows:
Baixe em https://github.com/microsoftarchive/redis/releases

### 5. Configurar .env

```bash
cp env.example .env
```

Edite `.env` com suas configurações:

```env
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=canal_ouvidoria
DB_USER=canal_user
DB_PASSWORD=sua_senha_segura

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# ... resto das configurações
```

### 6. Gerar chaves JWT

Siga os passos 3 e 4 da instalação com Docker.

### 7. Instalar dependências e iniciar

```bash
npm install
npm run dev
```

## Verificação Pós-Instalação

### 1. Testar health check

```bash
curl http://localhost:3001/health
```

### 2. Testar autenticação

```bash
# Solicitar magic link
curl -X POST http://localhost:3001/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ouvidoria.com"}'

# Verificar logs para ver o magic link gerado
docker-compose logs backend | grep "Magic link gerado"
```

### 3. Verificar banco de dados

```bash
# Com Docker
docker-compose exec postgres psql -U postgres -d canal_ouvidoria -c "\dt"

# Sem Docker
psql -U canal_user -d canal_ouvidoria -c "\dt"
```

Deve listar todas as tabelas criadas:
- usuarios
- comites
- relatos
- anexos
- relato_eventos
- comentarios
- mensagens_publicas
- magic_link_tokens
- refresh_tokens
- audit_log

### 4. Verificar Redis

```bash
# Com Docker
docker-compose exec redis redis-cli ping
# Resposta: PONG

# Sem Docker
redis-cli ping
# Resposta: PONG
```

## Configurações Adicionais

### Email (Produção)

Configure um provedor de email no `.env`:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxx
EMAIL_FROM=noreply@ouvidoria.com
```

Depois, implemente o serviço de email em `src/modules/auth/auth.service.ts`:

```typescript
async sendMagicLink(email: string, token: string, frontendUrl: string): Promise<void> {
  const magicLink = `${frontendUrl}/auth/verify?token=${token}`;
  
  await emailProvider.send({
    to: email,
    subject: 'Seu link de acesso - Canal de Ouvidoria',
    template: 'magic-link',
    data: { magicLink, expiresIn: '15 minutos' }
  });
}
```

### SSL/HTTPS (Produção)

Use um proxy reverso como NGINX:

```nginx
server {
    listen 443 ssl http2;
    server_name api.ouvidoria.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Erro: "Falha ao conectar com o banco de dados"

**Solução 1**: Verificar se o PostgreSQL está rodando
```bash
docker-compose ps postgres  # Com Docker
sudo systemctl status postgresql  # Sem Docker
```

**Solução 2**: Verificar credenciais no `.env`

**Solução 3**: Verificar firewall/rede

### Erro: "Cliente Redis não inicializado"

**Solução 1**: Verificar se o Redis está rodando
```bash
docker-compose ps redis  # Com Docker
redis-cli ping  # Sem Docker
```

**Solução 2**: Verificar configuração de host/porta no `.env`

### Erro: "TOKEN_INVALID"

**Solução**: Verificar se as chaves JWT estão corretas no `.env`
```bash
# Verificar se as chaves existem e estão no formato correto
cat keys/jwtRS256.key
cat keys/jwtRS256.key.pub
```

### Portas já em uso

Se as portas 3001, 5432 ou 6379 já estiverem em uso:

**Opção 1**: Mudar as portas no `docker-compose.yml` e `.env`

**Opção 2**: Parar os serviços que estão usando as portas
```bash
# Encontrar processo usando porta 3001
lsof -i :3001
# ou no Windows
netstat -ano | findstr :3001

# Matar processo
kill -9 PID  # Linux/Mac
taskkill /PID PID /F  # Windows
```

## Próximos Passos

1. ✅ Backend instalado e rodando
2. ⏭️ Configurar email provider
3. ⏭️ Implementar módulo de relatos
4. ⏭️ Implementar módulo de usuários
5. ⏭️ Implementar módulo de comitês
6. ⏭️ Conectar frontend ao backend
7. ⏭️ Testes em ambiente de homologação
8. ⏭️ Deploy em produção

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs: `docker-compose logs -f backend`
2. Consulte o README.md
3. Abra uma issue no repositório



