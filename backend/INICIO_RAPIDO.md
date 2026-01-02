# 🚀 Início Rápido - Backend Canal de Ouvidoria

## ✅ O que já foi resolvido

- ✅ **Redis**: Sistema configurado com fallback em memória (funciona sem Redis!)
- ✅ **Dependências**: Instaladas com `npm install`

## ❌ O que precisa ser configurado

### 1. PostgreSQL (URGENTE)

O erro atual é: **"Falha ao conectar com banco de dados - authentication failed"**

**Solução Rápida com Docker**:

```powershell
# 1. Instalar PostgreSQL via Docker (mais fácil)
docker run -d --name canal-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=canal_ouvidoria -p 5432:5432 postgres:15-alpine

# 2. Verificar se está rodando
docker ps

# 3. Testar conexão
docker exec -it canal-postgres psql -U postgres -d canal_ouvidoria -c "SELECT NOW();"
```

**OU Instalação Local**:
- Baixe: https://www.postgresql.org/download/windows/
- Instale e defina senha do usuário `postgres`
- Crie o banco: `CREATE DATABASE canal_ouvidoria;`

📖 **Guia completo**: Veja `DATABASE_SETUP.md`

### 2. Configurar Arquivo .env

Edite o arquivo `.env` no diretório `backend/`:

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=canal_ouvidoria
DB_USER=postgres
DB_PASSWORD=postgres  # ⚠️ Use a senha que você definiu!

# Porta do servidor
PORT=3001

# JWT (para desenvolvimento, pode deixar assim)
JWT_SECRET=dev-secret-key-change-in-production-min-32-chars
MAGIC_LINK_SECRET=dev-magic-link-secret-change-in-production-32

# Ambiente
NODE_ENV=development
```

### 3. Iniciar o Servidor

```powershell
cd backend
npm run dev
```

## 📋 Checklist de Configuração

- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados `canal_ouvidoria` criado
- [ ] Arquivo `.env` configurado com credenciais corretas
- [ ] Servidor inicia sem erros

## 🎯 Resultado Esperado

Quando tudo estiver configurado corretamente, você verá:

```
[INFO]: Conexão com banco de dados verificada com sucesso
[INFO]: ⚠️ Não foi possível conectar ao Redis. Usando fallback em memória
[INFO]: Servidor iniciado com sucesso
[INFO]: 🚀 API rodando em http://localhost:3001
[INFO]: 📊 Health check em http://localhost:3001/health
[INFO]: 🔐 Auth endpoints em http://localhost:3001/api/auth
```

## 🐛 Problemas Comuns

### Erro: authentication failed (28P01)
- **Causa**: Senha incorreta no `.env`
- **Solução**: Verifique a senha do PostgreSQL

### Erro: database does not exist
- **Causa**: Banco não foi criado
- **Solução**: `CREATE DATABASE canal_ouvidoria;`

### Erro: connection refused (ECONNREFUSED)
- **Causa**: PostgreSQL não está rodando
- **Solução**: Inicie o serviço/container PostgreSQL

## 📚 Documentação Completa

- `DATABASE_SETUP.md` - Guia completo do PostgreSQL
- `REDIS_SETUP.md` - Guia completo do Redis (opcional)
- `.env.example` - Modelo de configuração

## ⚡ Comandos Úteis

```powershell
# Backend
npm run dev          # Iniciar em modo desenvolvimento
npm run build        # Build para produção
npm start            # Iniciar produção

# PostgreSQL (Docker)
docker start canal-postgres    # Iniciar
docker stop canal-postgres     # Parar
docker logs canal-postgres     # Ver logs

# PostgreSQL (Local)
Get-Service postgresql*        # Ver status
Start-Service postgresql-*     # Iniciar
```

## 🆘 Precisa de Ajuda?

1. Verifique os logs de erro no console
2. Consulte `DATABASE_SETUP.md` para problemas do PostgreSQL
3. Consulte `REDIS_SETUP.md` para otimizar com Redis (opcional)

---

**Próximo Passo**: Configure o PostgreSQL e teste novamente com `npm run dev`
