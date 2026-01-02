# 🚀 Início Rápido - 5 minutos

Guia ultra-rápido para ter o backend rodando em minutos.

## Opção 1: Setup Automático com Docker (Recomendado)

```bash
# 1. Entrar na pasta
cd backend

# 2. Executar script de setup
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh

# 3. Iniciar servidor
npm run dev
```

✅ Pronto! API rodando em `http://localhost:3001`

## Opção 2: Setup Manual Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp env.example .env

# 3. Gerar chaves JWT
chmod +x scripts/generate-keys.sh
./scripts/generate-keys.sh

# 4. Iniciar banco de dados e Redis
docker-compose up -d postgres redis

# 5. Iniciar servidor
npm run dev
```

## Testar a API

### 1. Health Check

```bash
curl http://localhost:3001/health
```

Deve retornar:
```json
{
  "success": true,
  "service": "Canal de Ouvidoria API",
  "version": "1.0.0",
  ...
}
```

### 2. Solicitar Magic Link

```bash
curl -X POST http://localhost:3001/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ouvidoria.com"}'
```

### 3. Ver Magic Link gerado nos logs

```bash
docker-compose logs backend | grep "Magic link"
```

Você verá algo como:
```
Magic link gerado: http://localhost:5173/auth/verify?token=abc123...
```

### 4. Verificar Magic Link

Copie o token do log e use:

```bash
curl "http://localhost:3001/api/auth/verify-magic-link?token=SEU_TOKEN_AQUI"
```

Deve retornar tokens JWT:
```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  },
  "user": {
    "id": "uuid",
    "nome": "Administrador Master",
    "email": "admin@ouvidoria.com",
    "tipo": "ADMIN_MASTER"
  }
}
```

### 5. Usar Access Token

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```

## 🎯 Fluxo de Autenticação Completo

```
┌─────────────┐
│   USUÁRIO   │
└──────┬──────┘
       │ 1. Solicita magic link
       │    POST /api/auth/magic-link
       │    { "email": "user@example.com" }
       ▼
┌─────────────┐
│   BACKEND   │──── 2. Valida email e gera token
└──────┬──────┘     (armazena no DB com SHA-256)
       │
       │ 3. Envia email com link
       │    http://frontend/auth/verify?token=xxx
       ▼
┌─────────────┐
│   USUÁRIO   │──── 4. Clica no link
└──────┬──────┘
       │
       │ 5. Frontend chama backend
       │    GET /api/auth/verify-magic-link?token=xxx
       ▼
┌─────────────┐
│   BACKEND   │──── 6. Valida token, marca como usado
└──────┬──────┘     7. Gera JWT (access + refresh)
       │            8. Salva refresh token no DB
       ▼
┌─────────────┐
│  FRONTEND   │──── 9. Armazena tokens
└──────┬──────┘     10. Usa accessToken para requisições
       │
       │ Requisições autenticadas:
       │ Authorization: Bearer {accessToken}
       ▼
┌─────────────┐
│   BACKEND   │──── Valida JWT em cada requisição
└─────────────┘
```

## 📊 Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f backend

# Reiniciar backend
docker-compose restart backend

# Parar tudo
docker-compose down

# Limpar volumes (⚠️ apaga dados)
docker-compose down -v

# Executar testes
npm test

# Ver coverage
npm run test:coverage

# Lint
npm run lint

# Format
npm run format
```

## 🐛 Troubleshooting Rápido

### Porta 3001 já em uso
```bash
# Mude a porta no .env
PORT=3002
```

### "Falha ao conectar com o banco de dados"
```bash
# Reinicie o PostgreSQL
docker-compose restart postgres

# Veja os logs
docker-compose logs postgres
```

### "Cliente Redis não inicializado"
```bash
# Reinicie o Redis
docker-compose restart redis
```

### Limpar tudo e recomeçar
```bash
# Para containers
docker-compose down -v

# Remove node_modules
rm -rf node_modules

# Reinstala
npm install

# Recria banco
docker-compose up -d postgres redis
sleep 5
docker-compose exec postgres psql -U postgres -d canal_ouvidoria -f /docker-entrypoint-initdb.d/init.sql

# Reinicia backend
npm run dev
```

## 📚 Próximos Passos

- [ ] Configurar email provider (Sendgrid, AWS SES, etc)
- [ ] Implementar módulo de relatos
- [ ] Implementar módulo de usuários
- [ ] Implementar módulo de comitês
- [ ] Conectar com frontend
- [ ] Adicionar testes
- [ ] Deploy em produção

## 🔗 Links Importantes

- **API Local**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Auth Endpoints**: http://localhost:3001/api/auth

## 📖 Documentação Completa

- [README.md](./README.md) - Visão geral e documentação completa
- [INSTALLATION.md](./INSTALLATION.md) - Guia detalhado de instalação
- [requests.http](./requests.http) - Exemplos de requisições

---

**Dúvidas?** Consulte o README.md ou os logs: `docker-compose logs -f backend`



