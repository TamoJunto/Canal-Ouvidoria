#!/bin/bash

###
# Script para gerar chaves JWT RSA
###

set -e

echo "🔐 Gerando chaves JWT RSA..."

# Criar diretório
mkdir -p keys

# Gerar chave privada (4096 bits)
ssh-keygen -t rsa -b 4096 -m PEM -f keys/jwtRS256.key -N "" -q

# Extrair chave pública
openssl rsa -in keys/jwtRS256.key -pubout -outform PEM -out keys/jwtRS256.key.pub 2>/dev/null

echo "✅ Chaves geradas com sucesso!"
echo ""
echo "📁 Arquivos criados:"
echo "   - keys/jwtRS256.key (PRIVADA - NÃO COMPARTILHAR)"
echo "   - keys/jwtRS256.key.pub (PÚBLICA)"
echo ""
echo "📝 Para usar no .env, execute:"
echo ""
echo "# Chave Privada"
echo "JWT_PRIVATE_KEY=\"\$(awk '{printf \"%s\\\\n\", \$0}' keys/jwtRS256.key)\""
echo ""
echo "# Chave Pública"
echo "JWT_PUBLIC_KEY=\"\$(awk '{printf \"%s\\\\n\", \$0}' keys/jwtRS256.key.pub)\""
echo ""
echo "⚠️  IMPORTANTE: Nunca commite a chave privada no git!"
echo "    Adicione keys/ ao .gitignore"



