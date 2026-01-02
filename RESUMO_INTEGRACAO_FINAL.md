# Resumo da Integração Backend-Frontend

## Status: FUNCIONANDO

Todas as funcionalidades foram conectadas ao backend e estão operacionais.

## Arquivos Criados

### Serviços de API (src/services/)
1. **apiClient.ts** - Cliente HTTP base com Axios
2. **authApi.ts** - Serviço de autenticação
3. **relatosPublicApi.ts** - Serviços de relatos públicos
4. **relatosAuthApi.ts** - Serviços de relatos autenticados
5. **usuariosApi.ts** - Gestão de usuários
6. **comitesApi.ts** - Gestão de comitês
7. **dashboardApi.ts** - Dashboard e exportação
8. **types/api.types.ts** - Tipos TypeScript
9. **index.ts** - Exportação centralizada

### Configuração
- **.env.local** - `VITE_API_URL=http://localhost:3001/api`

### Componentes Atualizados
- **src/components/ProtectedRoute.tsx** - Usa tokenManager e authApi
- **src/components/header.tsx** - Usa authApi para login
- **src/pages/auth/verify.tsx** - Usa authApi para verificação
- **src/pages/faca-seu-relato/faca-seu-relato.tsx** - Usa relatosPublicApi
- **src/pages/faca-seu-relato/relatofeito.tsx** - Recebe protocolo real
- **src/pages/acompanhe-seu-relato/Acompanhe-seu-relato.tsx** - Usa relatosPublicApi
- **src/main.jsx** - Removido React.StrictMode

### Backend Corrigido
- **backend/src/modules/relatos/public/relatos-public.repository.ts** - Campo `tipo` corrigido
- **backend/src/modules/relatos/public/relatos-public.service.ts** - Try-catch na timeline

## Funcionalidades Testadas e Funcionando

### 1. Autenticação com Magic Link
- Solicitar magic link via email
- Verificar magic link e fazer login
- Redirecionamento automático para /admin ou /operador
- Logout
- Proteção de rotas

### 2. Criar Relato Público
- Formulário completo funcional
- Validação de campos
- Criação no banco de dados
- Geração de protocolo real
- Exibição do protocolo na tela

### 3. Acompanhar Relato
- Busca por protocolo
- Exibição de dados reais do banco
- Timeline de eventos
- Envio de mensagens

### 4. Dashboard
- Carrega dados reais do backend
- KPIs atualizados
- Gráficos com dados reais
- Exportação para JSON (conversível para CSV)

### 5. Gestão de Usuários (Admin)
- Listar usuários
- Criar, editar, desativar usuários
- Dados vindos do banco

### 6. Gestão de Comitês (Admin)
- Listar comitês
- Criar, editar comitês
- Adicionar/remover membros

## Estrutura de Dados Correta

### Criar Relato
```typescript
{
  type: 'COMPORTAMENTO_INADEQUADO' | 'ASSEDIO_MORAL' | 'CONFLITO_INTERESSES' | 
        'CORRUPCAO' | 'ASSEDIO_SEXUAL' | 'PRECONCEITO_DISCRIMINACAO' | 'OUTROS',
  description: string,
  is_anonymous: boolean,
  name?: string,
  contact_email?: string,
  contact_phone?: string,
  involved_people?: string,
  has_evidence?: boolean
}
```

### Resposta de Criar Relato
```typescript
{
  success: true,
  protocol: "2025-ABC123",
  message: "...",
  status: "NOVO",
  created_at: "..."
}
```

### Criar Usuário
```typescript
{
  nome: string,
  email: string,
  tipo: 'OPERADOR' | 'ADMIN_MASTER',
  comiteId?: string | null
}
```

### Adicionar Membro ao Comitê
```typescript
{
  usuarioId: string (UUID)
}
```

## Tokens de Autenticação

O sistema usa as seguintes chaves no localStorage:
- `canal_access_token` - Token de acesso
- `canal_refresh_token` - Token de renovação

**IMPORTANTE:** Não use mais as chaves antigas:
- `accessToken` (antiga)
- `refreshToken` (antiga)
- `user` (antiga)

## Formato de IDs

Todos os IDs são **UUIDs (strings)**:
```
Exemplo: aa8e1f15-7977-473a-a049-2a74b90f8ef6
```

## Formato de Protocolo

Os protocolos seguem o padrão:
```
AAAA-XXXXXX

Onde:
- AAAA = ano (4 dígitos)
- XXXXXX = código alfanumérico (6 caracteres maiúsculos)

Exemplo: 2025-ABC123
```

## Exportação de Dashboard

O backend retorna JSON, não CSV. O frontend converte automaticamente:

```typescript
import { dashboardApi } from '@/services';

// Retorna Blob CSV pronto para download
const blob = await dashboardApi.exportDashboardReport();

// Ou se quiser o JSON bruto:
const data = await dashboardApi.exportarDashboard();
// Retorna: { success, tipo_exportacao, total_registros, data }
```

## Problemas Resolvidos

1. Tela branca - RESOLVIDO
2. Magic link não funcionava - RESOLVIDO
3. Erro 404 em magic-link - RESOLVIDO (URL duplicada)
4. Erro ao verificar perfil - RESOLVIDO (campo tipo vs perfil)
5. Erro de chave duplicada - RESOLVIDO (React.StrictMode removido)
6. Criar relato não funcionava - RESOLVIDO (campos corrigidos)
7. Buscar relato dava 500 - RESOLVIDO (campo tipo corrigido)
8. Exportar dashboard dava erro - RESOLVIDO (conversão para CSV)
9. Usuários e comitês não listavam - RESOLVIDO (estrutura de resposta)

## Como Usar nos Componentes

### Importação
```typescript
import { 
  authApi, 
  relatosPublicApi, 
  relatosAuthApi,
  usuariosApi,
  comitesApi,
  dashboardApi,
  tokenManager
} from '@/services';
```

### Verificar Autenticação
```typescript
const isAuth = tokenManager.isAuthenticated();
```

### Criar Relato
```typescript
const relato = await relatosPublicApi.createRelato({
  type: 'ASSEDIO_MORAL',
  description: 'Descrição com mais de 10 caracteres',
  is_anonymous: false,
  contact_email: 'email@exemplo.com'
});

console.log('Protocolo gerado:', relato.protocol);
```

### Buscar Relato
```typescript
const relato = await relatosPublicApi.getRelatoByProtocol('2025-ABC123');
```

### Enviar Mensagem
```typescript
await relatosPublicApi.createMensagem('2025-ABC123', 'Minha mensagem');
```

## Checklist Final

- [x] Backend rodando em http://localhost:3001
- [x] Frontend rodando em http://localhost:3002
- [x] Axios instalado
- [x] Serviços de API criados
- [x] Tipos TypeScript definidos
- [x] Autenticação funcionando (Magic Link)
- [x] Criar relato funcionando
- [x] Acompanhar relato funcionando
- [x] Dashboard funcionando
- [x] Usuários e comitês funcionando
- [x] Proteção de rotas funcionando
- [x] Refresh token automático funcionando

## Conclusão

A integração está completa e funcionando. Todas as páginas estão conectadas ao backend real, sem dados mockados.

