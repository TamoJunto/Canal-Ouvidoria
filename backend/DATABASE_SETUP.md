# Configuração do Banco de Dados PostgreSQL

## 📋 Visão Geral

O backend usa **PostgreSQL** como banco de dados principal.

## 🚀 Instalação do PostgreSQL

### Opção 1: Docker (Recomendado para Desenvolvimento)

```bash
# Criar e iniciar container PostgreSQL
docker run -d \
  --name canal-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=canal_ouvidoria \
  -p 5432:5432 \
  postgres:15-alpine

# Verificar se está rodando
docker ps | findstr canal-postgres

# Parar
docker stop canal-postgres

# Iniciar novamente
docker start canal-postgres

# Ver logs
docker logs canal-postgres
```

### Opção 2: Windows (Instalação Local)

1. **Download**: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Durante a instalação:
   - Defina a senha do usuário `postgres`
   - Porta padrão: `5432`
   - Locale: `Portuguese, Brazil`

4. Após a instalação, abra o **pgAdmin** ou **SQL Shell (psql)**

### Opção 3: WSL2

```bash
# No WSL2
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres psql
```

## ⚙️ Configuração Inicial

### 1. Criar o Banco de Dados

#### Via psql (Command Line)
```bash
# Conectar ao PostgreSQL
psql -U postgres -h localhost

# Criar banco
CREATE DATABASE canal_ouvidoria;

# Verificar
\l

# Sair
\q
```

#### Via pgAdmin (Interface Gráfica)
1. Abra o pgAdmin
2. Conecte ao servidor local
3. Clique com botão direito em "Databases"
4. Create > Database
5. Nome: `canal_ouvidoria`
6. Owner: `postgres`
7. Save

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo:
```bash
cd backend
copy .env.example .env
```

Edite o arquivo `.env` e configure:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=canal_ouvidoria
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_AQUI  # ⚠️ Altere isso!
```

### 3. Executar Migrations

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Executar migrations
npm run migrate

# Ou criar manualmente as tabelas (veja schema.sql)
```

## 📊 Schema do Banco

O banco possui as seguintes tabelas principais:

- `usuarios` - Usuários do sistema (admin, operadores, comitês)
- `comites` - Comitês de ética
- `relatos` - Denúncias/relatos
- `mensagens` - Mensagens trocadas sobre relatos
- `anexos` - Arquivos anexados aos relatos
- `historico_status` - Histórico de mudanças de status

## 🧪 Testar Conexão

### Via Backend
```bash
npm run dev
```

Se aparecer no console:
```
✅ Conexão com banco de dados verificada com sucesso
✅ Servidor iniciado com sucesso
```

**Sucesso!** ✅

### Via psql
```bash
psql -U postgres -h localhost -d canal_ouvidoria -c "SELECT NOW();"
```

### Via Node.js
Crie um arquivo `test-db.js`:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'canal_ouvidoria',
  user: 'postgres',
  password: 'postgres',
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro:', err);
  } else {
    console.log('✅ Conectado! Hora do servidor:', res.rows[0].now);
  }
  pool.end();
});
```

Execute:
```bash
node test-db.js
```

## 🔧 Problemas Comuns

### Erro: "authentication failed" (28P01)

**Causa**: Senha incorreta no `.env`

**Solução**:
1. Verifique a senha no arquivo `.env`
2. Tente redefinir a senha do usuário postgres:

```sql
-- No psql como superuser
ALTER USER postgres WITH PASSWORD 'nova_senha';
```

### Erro: "database does not exist"

**Solução**:
```sql
-- Criar o banco
CREATE DATABASE canal_ouvidoria;
```

### Erro: "connection refused" (porta 5432)

**Causas possíveis**:
1. PostgreSQL não está rodando
2. Firewall bloqueando
3. Porta incorreta

**Soluções**:

```bash
# Windows - verificar se PostgreSQL está rodando
Get-Service postgresql*

# Iniciar serviço (se parado)
Start-Service postgresql-x64-15  # ajuste o nome do serviço

# Verificar porta
netstat -an | findstr :5432

# Docker - verificar container
docker ps | findstr postgres
docker start canal-postgres
```

### Erro: "too many connections"

**Solução**: Ajuste o pool de conexões no `.env`:
```env
DB_POOL_MIN=1
DB_POOL_MAX=5
```

### Erro: "SSL connection required"

**Solução**: Configure SSL no arquivo `database.ts`:
```typescript
ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
```

E no `.env`:
```env
DB_SSL=false  # para desenvolvimento local
```

## 🔐 Segurança

### Desenvolvimento
- OK usar senhas simples como `postgres`
- OK armazenar credenciais no `.env`

### Produção
- ❌ **NUNCA** commit o arquivo `.env`
- ✅ Use senhas fortes (mínimo 16 caracteres)
- ✅ Use variáveis de ambiente do servidor/cloud
- ✅ Configure SSL/TLS
- ✅ Limite conexões por IP
- ✅ Use usuário com permissões restritas (não use `postgres`)

### Criar Usuário com Permissões Restritas (Produção)

```sql
-- Criar usuário
CREATE USER canal_app WITH PASSWORD 'senha_forte_aqui';

-- Conceder permissões apenas no banco específico
GRANT CONNECT ON DATABASE canal_ouvidoria TO canal_app;
GRANT USAGE ON SCHEMA public TO canal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO canal_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO canal_app;
```

## 📚 Ferramentas Úteis

### Clientes GUI
- **pgAdmin** (incluído na instalação do PostgreSQL)
- **DBeaver** (gratuito, multi-plataforma)
- **TablePlus** (macOS/Windows, versão free limitada)
- **Azure Data Studio** (gratuito, Microsoft)

### Extensões VS Code
- **PostgreSQL** (Chris Kolkman)
- **SQLTools** + Driver PostgreSQL

## 🔄 Backup e Restore

### Backup
```bash
# Backup completo
pg_dump -U postgres -h localhost canal_ouvidoria > backup.sql

# Backup com compressão
pg_dump -U postgres -h localhost -Fc canal_ouvidoria > backup.dump
```

### Restore
```bash
# De arquivo .sql
psql -U postgres -h localhost canal_ouvidoria < backup.sql

# De arquivo .dump
pg_restore -U postgres -h localhost -d canal_ouvidoria backup.dump
```

## 📊 Monitoramento

### Ver conexões ativas
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'canal_ouvidoria';
```

### Ver tamanho do banco
```sql
SELECT pg_size_pretty(pg_database_size('canal_ouvidoria'));
```

### Ver queries lentas (se log_min_duration_statement configurado)
```sql
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

## 🌐 PostgreSQL em Cloud

Para produção, considere usar serviços gerenciados:

- **AWS RDS** (PostgreSQL)
- **Azure Database for PostgreSQL**
- **Google Cloud SQL**
- **DigitalOcean Managed Databases**
- **Heroku Postgres**
- **Supabase** (PostgreSQL + APIs)

## 💡 Próximos Passos

1. ✅ Instalar PostgreSQL
2. ✅ Criar banco `canal_ouvidoria`
3. ✅ Configurar `.env` com credenciais
4. ✅ Testar conexão
5. ⬜ Executar migrations
6. ⬜ Popular dados iniciais (seeds)
7. ⬜ Iniciar desenvolvimento

## 📞 Suporte

- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [Tutoriais PostgreSQL em Português](https://www.postgresql.org/docs/current/tutorial.html)
- [Comunidade PostgreSQL Brasil](https://www.postgresql.org.br/)
