# Canal de Ouvidoria - Backend API

Backend Node.js/TypeScript para o sistema de ouvidoria (canal de denúncias) com autenticação passwordless (Magic Link).

## 🚀 Stack Tecnológica

- **Runtime**: Node.js 18+
- **Linguagem**: TypeScript
- **Framework**: Express
- **Banco de Dados**: PostgreSQL 16
- **Cache/Sessions**: Redis 7
- **Autenticação**: Magic Link (passwordless) + JWT
- **Validação**: Zod
- **Logs**: Pino
- **Tests**: Jest

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- Docker e Docker Compose (recomendado)
- PostgreSQL 16 (se não usar Docker)
- Redis 7 (se não usar Docker)

## 🛠️ Configuração

### 1. Clonar e instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure:

```bash
cp env.example .env
```

**Importante**: Gere chaves RSA para JWT:

```bash
# Gerar chave privada
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key -N ""

# Extrair chave pública
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub

# Adicione as chaves ao .env (em uma linha, substituindo quebras por \n)
```

### 3. Iniciar com Docker (recomendado)

```bash
# Inicia PostgreSQL, Redis e Backend
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Parar serviços
docker-compose down
```

### 4. Ou iniciar manualmente

```bash
# Certifique-se de que PostgreSQL e Redis estão rodando

# Executar migrations (inicializa o banco)
npm run db:migrate

# Modo desenvolvimento (hot reload)
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start
```

## 📡 Endpoints Principais

### Autenticação

#### POST `/api/auth/magic-link`
Solicita um magic link para autenticação.

**Request:**
```json
{
  "email": "admin@ouvidoria.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Se o email estiver cadastrado, você receberá um link de acesso."
}
```

**Rate Limits:**
- 3 requisições/hora por email
- 10 requisições/hora por IP

---

#### GET `/api/auth/verify-magic-link?token={token}`
Verifica o magic link e retorna tokens JWT.

**Query Params:**
- `token` (string, 64 chars): Token do magic link

**Response:**
```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIs..."
  },
  "user": {
    "id": "uuid",
    "nome": "Administrador Master",
    "email": "admin@ouvidoria.com",
    "tipo": "ADMIN_MASTER"
  }
}
```

---

#### POST `/api/auth/refresh`
Renova os tokens usando o refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIs..."
  }
}
```

---

#### POST `/api/auth/logout`
Faz logout revogando o refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
  "revokeAll": false
}
```

**Headers (opcional):**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso."
}
```

---

#### GET `/api/auth/me`
Retorna informações do usuário autenticado.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "admin@ouvidoria.com",
    "tipo": "ADMIN_MASTER"
  }
}
```

---

### Health Check

#### GET `/health`
Verifica se a API está rodando.

**Response:**
```json
{
  "success": true,
  "service": "Canal de Ouvidoria API",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "development"
}
```

## 🔐 Autenticação

O sistema usa **Magic Link** (autenticação sem senha):

1. Usuário solicita um magic link informando seu email
2. Sistema valida se o email existe e está ativo
3. Email é enviado com link único (válido por 15 minutos)
4. Usuário clica no link
5. Sistema valida o token e retorna:
   - **Access Token** (JWT, 15 minutos)
   - **Refresh Token** (JWT, 7 dias)
6. Frontend usa access token para requisições autenticadas
7. Quando access token expira, usa refresh token para renovar

### Refresh Token Rotation

Por segurança, implementamos **refresh token rotation**:
- Cada vez que um refresh token é usado, ele é revogado
- Um novo par de tokens é gerado
- Se detectar uso suspeito, todas as sessões do usuário são revogadas

### Device Fingerprinting

Sistema gera um fingerprint baseado em:
- User Agent
- IP

Se o fingerprint mudar ao usar refresh token, a sessão é considerada comprometida e todas as sessões do usuário são revogadas.

## 🛡️ Segurança

### Proteções Implementadas

- ✅ Rate limiting (Redis)
- ✅ CORS configurável
- ✅ Helmet.js (headers de segurança)
- ✅ Tokens JWT com RS256 (assimétrico)
- ✅ Hash SHA-256 para tokens no banco
- ✅ Timing-safe comparisons
- ✅ Device fingerprinting
- ✅ Refresh token rotation
- ✅ Logs estruturados com redação de dados sensíveis
- ✅ Validação de inputs com Zod
- ✅ Soft delete (LGPD compliance)

### Rate Limits

| Endpoint | Limite |
|----------|--------|
| Geral (por IP) | 30 req/min |
| Magic Link (por email) | 3 req/hora |
| Magic Link (por IP) | 10 req/hora |
| Criação de relatos | 10 req/hora |
| Mensagens públicas | 5 req/dia |

## 📊 Banco de Dados

### Schema Principal

- **usuarios**: Admin Master e Operadores
- **comites**: Grupos de trabalho
- **relatos**: Denúncias/relatos
- **anexos**: Arquivos anexados
- **relato_eventos**: Timeline de eventos
- **comentarios**: Comentários internos da equipe
- **mensagens_publicas**: Mensagens denunciante ↔️ equipe
- **magic_link_tokens**: Tokens de autenticação
- **refresh_tokens**: Tokens de sessão
- **audit_log**: Auditoria imutável

### Migrations

O script `init.sql` no Docker cria toda a estrutura automaticamente.

Para executar manualmente:

```bash
psql -U postgres -d canal_ouvidoria -f init.sql
```

## 📝 Logs

Logs estruturados com Pino:

```json
{
  "level": "info",
  "time": "2025-01-15T10:30:00.000Z",
  "pid": 12345,
  "hostname": "backend-1",
  "type": "http",
  "req": {
    "method": "POST",
    "url": "/api/auth/magic-link",
    "ip": "192.168.1.1"
  },
  "res": {
    "statusCode": 200
  },
  "responseTime": 45,
  "msg": "request completed"
}
```

### Níveis de Log

- `trace`: Mais verboso
- `debug`: Debugging
- `info`: Informações gerais
- `warn`: Avisos
- `error`: Erros
- `fatal`: Erros críticos

Configure via `LOG_LEVEL` no `.env`.

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Build para produção
npm start            # Inicia versão de produção
npm test             # Executa testes
npm run lint         # Verifica código
npm run format       # Formata código
npm run db:migrate   # Executa migrations
npm run db:seed      # Popula banco com dados iniciais
```

## 📁 Estrutura de Diretórios

```
backend/
├── src/
│   ├── config/           # Configurações (DB, Redis, JWT)
│   ├── middlewares/      # Middlewares Express
│   ├── modules/          # Módulos da aplicação
│   │   └── auth/         # Módulo de autenticação
│   │       ├── auth.routes.ts
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       ├── auth.repository.ts
│   │       └── auth.validators.ts
│   ├── utils/            # Utilitários
│   └── server.ts         # Entry point
├── dist/                 # Build output
├── uploads/              # Arquivos uploadados
├── docker-compose.yml    # Orquestração Docker
├── Dockerfile           # Imagem Docker
├── init.sql             # Script de inicialização do DB
├── package.json
├── tsconfig.json
└── README.md
```

## 🚦 Próximos Passos

- [ ] Implementar módulo de relatos públicos
- [ ] Implementar módulo de relatos autenticados
- [ ] Implementar módulo de usuários
- [ ] Implementar módulo de comitês
- [ ] Implementar dashboard/analytics
- [ ] Implementar upload de anexos
- [ ] Implementar serviço de email real
- [ ] Implementar testes automatizados
- [ ] CI/CD pipeline
- [ ] Documentação Swagger/OpenAPI

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ para compliance e integridade organizacional**



