#!/bin/bash

###
# Script de setup rápido para desenvolvimento
# Configura o ambiente e gera chaves necessárias
###

set -e

echo "🚀 Configurando ambiente de desenvolvimento..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verifica Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
echo "✅ Node.js $NODE_VERSION encontrado"
echo ""

# Verifica npm
echo "📦 Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm $NPM_VERSION encontrado"
echo ""

# Verifica Docker
echo "🐳 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker não encontrado. Docker é recomendado mas opcional."
    echo "    Você precisará instalar PostgreSQL e Redis manualmente."
else
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    echo "✅ Docker $DOCKER_VERSION encontrado"
    
    if ! command -v docker-compose &> /dev/null; then
        echo "⚠️  Docker Compose não encontrado"
    else
        COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
        echo "✅ Docker Compose $COMPOSE_VERSION encontrado"
    fi
fi
echo ""

# Instalar dependências
echo "📚 Instalando dependências..."
npm install
echo "✅ Dependências instaladas"
echo ""

# Copiar .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp env.example .env
    echo "✅ Arquivo .env criado"
else
    echo "⚠️  Arquivo .env já existe, pulando..."
fi
echo ""

# Criar diretório de chaves
echo "🔐 Gerando chaves JWT..."
mkdir -p keys

# Gerar chaves RSA
if [ ! -f keys/jwtRS256.key ]; then
    ssh-keygen -t rsa -b 4096 -m PEM -f keys/jwtRS256.key -N "" -q
    openssl rsa -in keys/jwtRS256.key -pubout -outform PEM -out keys/jwtRS256.key.pub 2>/dev/null
    
    # Adicionar chaves ao .env
    echo "" >> .env
    echo "# Chaves JWT (geradas automaticamente)" >> .env
    echo "JWT_PRIVATE_KEY=\"$(awk '{printf "%s\\n", $0}' keys/jwtRS256.key)\"" >> .env
    echo "JWT_PUBLIC_KEY=\"$(awk '{printf "%s\\n", $0}' keys/jwtRS256.key.pub)\"" >> .env
    
    echo "✅ Chaves JWT geradas e adicionadas ao .env"
else
    echo "⚠️  Chaves JWT já existem, pulando..."
fi
echo ""

# Criar pasta de uploads
echo "📁 Criando diretório de uploads..."
mkdir -p uploads
echo "✅ Diretório de uploads criado"
echo ""

# Verificar se deve iniciar Docker
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Deseja iniciar os containers Docker (PostgreSQL + Redis)? (s/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([sS][iI][mM]|[sS])$ ]]; then
        echo "🐳 Iniciando containers..."
        docker-compose up -d postgres redis
        
        echo "⏳ Aguardando serviços iniciarem..."
        sleep 5
        
        echo "✅ Containers iniciados"
        echo ""
        echo "📊 Status dos containers:"
        docker-compose ps
        echo ""
    fi
fi

# Resumo final
echo ""
echo -e "${GREEN}✨ Setup concluído com sucesso!${NC}"
echo ""
echo "📝 Próximos passos:"
echo "   1. Configure o arquivo .env conforme necessário"
echo "   2. Se não usar Docker, configure PostgreSQL e Redis"
echo "   3. Execute: npm run dev"
echo ""
echo "🔗 Links úteis:"
echo "   - API:           http://localhost:3001"
echo "   - Health check:  http://localhost:3001/health"
echo "   - PostgreSQL:    localhost:5432"
echo "   - Redis:         localhost:6379"
echo ""
echo "📚 Documentação:"
echo "   - README.md"
echo "   - INSTALLATION.md"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"



