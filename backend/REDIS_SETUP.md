# Configuração do Redis

## 📋 Visão Geral

O backend usa Redis para:
- ✅ **Rate limiting** (controle de taxa de requisições)
- ✅ **Cache de sessões**
- ✅ **Armazenamento de tokens temporários**

## 🔄 Modo Fallback (Desenvolvimento)

**O backend funciona SEM Redis instalado!** 

Se o Redis não estiver disponível, o sistema automaticamente usa um **armazenamento em memória** como fallback. Você verá esta mensagem no console:

```
⚠️ Não foi possível conectar ao Redis. Usando fallback em memória para desenvolvimento.
```

### ⚠️ Limitações do Modo Fallback

- Os dados são perdidos quando o servidor reinicia
- Não funciona em ambientes com múltiplas instâncias/servidores
- **NÃO USAR EM PRODUÇÃO**

## 🚀 Como Instalar Redis

### Opção 1: Docker (Recomendado)

```bash
# Iniciar Redis
docker run -d -p 6379:6379 --name canal-redis redis:alpine

# Parar Redis
docker stop canal-redis

# Reiniciar Redis
docker start canal-redis

# Ver logs
docker logs canal-redis
```

### Opção 2: Windows (Instalação Local)

#### Via Chocolatey
```powershell
choco install redis-64
redis-server
```

#### Download Manual
1. Baixe do repositório oficial: https://github.com/microsoftarchive/redis/releases
2. Extraia os arquivos
3. Execute `redis-server.exe`

### Opção 3: WSL2 (Windows Subsystem for Linux)

```bash
# No WSL2
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

## ⚙️ Configuração

Crie/edite o arquivo `.env` na raiz do backend:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Rate Limiting
RATE_LIMIT_WINDOW=60000              # 1 minuto em ms
RATE_LIMIT_MAX_REQUESTS=30           # 30 requisições por janela
RATE_LIMIT_RELATOS_MAX=10            # 10 relatos por hora
MAGIC_LINK_RATE_LIMIT_EMAIL=3        # 3 magic links por email/hora
MAGIC_LINK_RATE_LIMIT_IP=10          # 10 magic links por IP/hora
```

## 🧪 Testar Conexão

### Via Redis CLI
```bash
redis-cli ping
# Resposta esperada: PONG
```

### Via PowerShell (Windows)
```powershell
# Se Redis estiver rodando
Test-NetConnection localhost -Port 6379
```

## 🔍 Monitoramento

### Ver comandos em tempo real
```bash
redis-cli monitor
```

### Ver todas as chaves
```bash
redis-cli keys "*"
```

### Ver informações do servidor
```bash
redis-cli info
```

## 🐛 Resolução de Problemas

### Redis não inicia no Docker
```bash
# Remove o container antigo
docker rm canal-redis

# Cria um novo
docker run -d -p 6379:6379 --name canal-redis redis:alpine
```

### Porta 6379 já está em uso
```bash
# Windows - ver o que está usando a porta
netstat -ano | findstr :6379

# Matar o processo (substitua PID pelo número retornado)
taskkill /PID <PID> /F
```

### Erro de conexão no backend
1. Verifique se o Redis está rodando: `redis-cli ping`
2. Verifique as variáveis de ambiente no `.env`
3. Verifique o firewall/antivírus

## 📊 Uso em Produção

Para produção, configure um serviço Redis gerenciado:

- **AWS**: Amazon ElastiCache
- **Azure**: Azure Cache for Redis
- **Google Cloud**: Cloud Memorystore
- **DigitalOcean**: Managed Redis
- **Heroku**: Heroku Redis

Configure as variáveis de ambiente:
```env
REDIS_HOST=seu-redis.cloud.com
REDIS_PORT=6379
REDIS_PASSWORD=sua-senha-segura
REDIS_DB=0
```

## 💡 Dicas

1. **Desenvolvimento**: Use o fallback em memória (sem Redis)
2. **Staging/Testes**: Use Redis local ou Docker
3. **Produção**: Use Redis gerenciado com backup e alta disponibilidade
4. **Performance**: Configure MaxMemory e políticas de eviction adequadas

## 📚 Recursos Adicionais

- [Documentação Redis](https://redis.io/documentation)
- [Redis no Windows](https://github.com/microsoftarchive/redis)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [Redis Commands](https://redis.io/commands)
