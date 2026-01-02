# Guia de Integração Backend-Frontend

## Arquivos Criados

### Serviços de API
- `src/services/apiClient.ts` - Cliente HTTP base (Axios)
- `src/services/authApi.ts` - Autenticação
- `src/services/relatosPublicApi.ts` - Relatos públicos
- `src/services/relatosAuthApi.ts` - Relatos autenticados
- `src/services/usuariosApi.ts` - Gestão de usuários
- `src/services/comitesApi.ts` - Gestão de comitês
- `src/services/dashboardApi.ts` - Dashboard
- `src/services/types/api.types.ts` - Tipos TypeScript
- `src/services/index.ts` - Exportação centralizada

### Configuração
- `.env.local` - Variáveis de ambiente

### Componentes Atualizados
- `src/components/ProtectedRoute.tsx` - Usa tokenManager e authApi
- `src/components/header.tsx` - Usa authApi
- `src/pages/auth/verify.tsx` - Usa authApi

## Configuração

O arquivo `.env.local` foi criado com:
```
VITE_API_URL=http://localhost:3001/api
```

## Como Usar

### Importação
```typescript
import { authApi, relatosPublicApi, dashboardApi } from '@/services';
```

### Exemplos

#### Login com Magic Link
```typescript
import { authApi } from '@/services';

// Solicitar magic link
await authApi.requestMagicLink('email@exemplo.com');

// Verificar token
const { user, accessToken } = await authApi.verifyMagicLink(token);

// Obter usuário autenticado
const user = await authApi.getMe();

// Logout
await authApi.logout();
```

#### Criar Relato
```typescript
import { relatosPublicApi } from '@/services';

const relato = await relatosPublicApi.createRelato({
  tipo: 'DENUNCIA',
  descricao: 'Descrição...',
  anonimo: false,
  contato_email: 'email@exemplo.com',
});
```

#### Consultar Relato
```typescript
const relato = await relatosPublicApi.getRelatoByProtocol('ABC123');
```

#### Dashboard
```typescript
import { dashboardApi } from '@/services';

const dashboard = await dashboardApi.getDashboard();
```

## Autenticação Automática

O sistema gerencia tokens automaticamente:
- Token adicionado em todas as requisições autenticadas
- Refresh automático quando o token expira
- Logout automático quando o refresh falha
- Armazenamento no localStorage com chaves: `canal_access_token` e `canal_refresh_token`

### Verificar Autenticação
```typescript
import { tokenManager } from '@/services';

const isAuth = tokenManager.isAuthenticated();
```

### Limpar Tokens
```typescript
import { authApi } from '@/services';

await authApi.logout();
```

## Endpoints Disponíveis

### Autenticação (/auth)
- POST /magic-link - Solicitar magic link
- GET /verify-magic-link - Verificar magic link
- POST /refresh - Renovar tokens
- POST /logout - Fazer logout
- GET /me - Dados do usuário autenticado

### Relatos Públicos (/public/relatos)
- POST / - Criar relato
- GET /:protocol - Consultar por protocolo
- POST /:protocol/mensagens - Enviar mensagem
- POST /:protocol/anexos - Upload de anexos
- GET /:protocol/anexos - Listar anexos
- GET /:protocol/anexos/:id - Download de anexo

### Relatos Autenticados (/relatos)
- GET / - Listar relatos
- GET /:id - Detalhes completos
- POST /:id/iniciar - Iniciar tratamento
- POST /:id/comentarios - Adicionar comentário
- POST /:id/transferir - Transferir para outro comitê
- POST /:id/responder - Responder ao denunciante
- POST /:id/finalizar - Finalizar relato
- POST /:id/reabrir - Reabrir relato

### Dashboard (/dashboard)
- GET / - Todos os dados
- GET /kpis - KPIs gerais
- GET /por-status - Agrupado por status
- GET /por-tipo - Agrupado por tipo
- GET /por-prioridade - Agrupado por prioridade
- GET /por-comite - Agrupado por comitê
- GET /por-periodo - Série temporal
- GET /exportar - Exportar relatório

### Usuários (/usuarios)
- GET / - Listar usuários
- GET /:id - Ver detalhes
- POST / - Criar usuário
- PUT /:id - Atualizar usuário
- DELETE /:id - Desativar usuário
- POST /:id/reativar - Reativar usuário

### Comitês (/comites)
- GET / - Listar comitês
- GET /:id - Ver detalhes
- POST / - Criar comitê
- PUT /:id - Atualizar comitê
- DELETE /:id - Desativar comitê
- POST /:id/reativar - Reativar comitê
- POST /:id/membros - Adicionar membro
- DELETE /:id/membros/:userId - Remover membro

## Testando

### 1. Iniciar Backend
```bash
cd backend
npm run dev
```

### 2. Iniciar Frontend
```bash
npm run dev
```

### 3. Testar Login
1. Acesse http://localhost:3002
2. Clique em "LOGIN ADMIN"
3. Digite um email que existe no banco
4. Verifique o console do BACKEND para ver a URL do Ethereal
5. Acesse a URL e clique no link do email
6. Deve fazer login e redirecionar

## Tratamento de Erros

```typescript
try {
  const relato = await relatosPublicApi.createRelato(dados);
} catch (error: any) {
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Mensagem:', error.response.data.message);
  } else if (error.request) {
    console.error('Sem resposta do servidor');
  } else {
    console.error('Erro:', error.message);
  }
}
```

## Problemas Comuns

### Erro de CORS
Verifique se o backend aceita `http://localhost:3002` em `backend/src/server.ts` linha 33.

### Token Inválido
Limpe o localStorage:
```javascript
localStorage.clear();
location.reload();
```

### Backend não responde
Verifique se está rodando em http://localhost:3001/health

## Checklist

- [x] Axios instalado
- [x] Cliente HTTP configurado
- [x] Tipos TypeScript criados
- [x] Serviços de API implementados
- [x] Autenticação automática configurada
- [x] Refresh token automático
- [x] Arquivo .env.local criado
- [x] Componentes atualizados

