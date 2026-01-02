# Correções nos Endpoints

## Problemas Corrigidos

### 1. Relatos Públicos

**Campos Corrigidos:**
- `tipo` → `type`
- `descricao` → `description`
- `anonimo` → `is_anonymous`
- `contato_nome` → `name`
- `contato_email` → `contact_email`
- `contato_telefone` → `contact_phone`
- `envolvidos` → `involved_people`
- `evidencias` → `has_evidence` (boolean)

**Tipos Válidos Atualizados:**
- `COMPORTAMENTO_INADEQUADO`
- `ASSEDIO_MORAL`
- `CONFLITO_INTERESSES`
- `CORRUPCAO`
- `ASSEDIO_SEXUAL`
- `PRECONCEITO_DISCRIMINACAO`
- `OUTROS`

**Exemplo de Uso:**
```typescript
import { relatosPublicApi } from '@/services';

const relato = await relatosPublicApi.createRelato({
  type: 'COMPORTAMENTO_INADEQUADO',
  description: 'Descrição do relato...',
  is_anonymous: false,
  name: 'João Silva',
  contact_email: 'joao@email.com',
  involved_people: 'Maria, Pedro',
  has_evidence: true,
});
```

### 2. Mensagens em Relatos

**Campo Corrigido:**
- `texto` → `content`

**Exemplo:**
```typescript
await relatosPublicApi.createMensagem('2025-ABC123', 'Minha mensagem aqui');
```

### 3. Usuários

**Campos Corrigidos:**
- `perfil` → `tipo`
- `comite_ids` (array) → `comiteId` (string único ou null)

**Exemplo:**
```typescript
import { usuariosApi } from '@/services';

const usuario = await usuariosApi.createUsuario({
  nome: 'João Silva',
  email: 'joao@email.com',
  tipo: 'OPERADOR',
  comiteId: 'uuid-do-comite', // ou null
});
```

### 4. Comitês - Membros

**Campo Corrigido:**
- `usuario_id` → `usuarioId`

**IDs agora são UUIDs (string), não números**

**Exemplo:**
```typescript
import { comitesApi } from '@/services';

// Adicionar membro
await comitesApi.addMembro(
  'uuid-do-comite',
  'uuid-do-usuario'
);

// Remover membro
await comitesApi.removeMembro(
  'uuid-do-comite',
  'uuid-do-usuario'
);
```

### 5. Dashboard - Exportar

**IMPORTANTE:** O backend retorna **JSON**, não CSV/Excel.

O endpoint `/dashboard/exportar` retorna:
```json
{
  "success": true,
  "tipo_exportacao": "COMPLETO",
  "total_registros": 150,
  "data": [...]
}
```

Para converter em CSV no frontend, você precisa fazer manualmente:

```typescript
import { dashboardApi } from '@/services';

const resultado = await dashboardApi.exportarDashboard();

// Converter para CSV manualmente
const convertToCSV = (data: any[]) => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

const csv = convertToCSV(resultado.data);
const blob = new Blob([csv], { type: 'text/csv' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'dashboard-export.csv';
a.click();
```

## Protocolo de Relatos

O formato do protocolo é: `AAAA-XXXXXX`

Exemplo: `2025-ABC123`

- AAAA = ano (4 dígitos)
- XXXXXX = código alfanumérico (6 caracteres)

## IDs

**Todos os IDs agora são UUIDs (string), não números:**

```typescript
// Antes (errado)
const id: number = 1;

// Agora (correto)
const id: string = 'aa8e1f15-7977-473a-a049-2a74b90f8ef6';
```

## Campos Obrigatórios

### Criar Relato
- `type` - obrigatório
- `description` - obrigatório (mínimo 10, máximo 5000 caracteres)
- `is_anonymous` - obrigatório (boolean)
- Se `is_anonymous: false`, precisa ter `contact_email` OU `contact_phone`

### Criar Usuário
- `nome` - obrigatório (mínimo 2, máximo 100 caracteres)
- `email` - obrigatório (válido)
- `tipo` - obrigatório ('ADMIN_MASTER' ou 'OPERADOR')
- `comiteId` - opcional (UUID ou null)

### Criar Comitê
- `nome` - obrigatório (mínimo 2, máximo 100 caracteres)
- `descricao` - opcional (máximo 500 caracteres)

## Teste Completo

```typescript
import { 
  relatosPublicApi,
  usuariosApi,
  comitesApi,
  dashboardApi
} from '@/services';

// 1. Criar Relato
const relato = await relatosPublicApi.createRelato({
  type: 'ASSEDIO_MORAL',
  description: 'Descrição detalhada do caso de assédio moral...',
  is_anonymous: false,
  name: 'Fulano de Tal',
  contact_email: 'fulano@email.com',
  involved_people: 'Chefe João',
  has_evidence: true,
});

console.log('Protocolo:', relato.relato.protocolo);

// 2. Buscar Relato
const relatoConsulta = await relatosPublicApi.getRelatoByProtocol(
  relato.relato.protocolo
);

// 3. Enviar Mensagem
await relatosPublicApi.createMensagem(
  relato.relato.protocolo,
  'Esta é minha mensagem de acompanhamento'
);

// 4. Criar Usuário (requer autenticação como ADMIN_MASTER)
const usuario = await usuariosApi.createUsuario({
  nome: 'Novo Operador',
  email: 'operador@email.com',
  tipo: 'OPERADOR',
  comiteId: null,
});

// 5. Criar Comitê (requer autenticação como ADMIN_MASTER)
const comite = await comitesApi.createComite({
  nome: 'Comitê de Ética',
  descricao: 'Responsável por questões éticas',
});

// 6. Adicionar Membro ao Comitê
await comitesApi.addMembro(comite.id, usuario.id);

// 7. Dashboard
const dashboard = await dashboardApi.getDashboard();
console.log('Total de relatos:', dashboard.kpis.total_relatos);

// 8. Exportar Dashboard
const exportacao = await dashboardApi.exportarDashboard();
console.log('Total de registros:', exportacao.total_registros);
```

## Erros Comuns

### Erro: "Descrição deve ter no mínimo 10 caracteres"
**Causa:** Campo `description` muito curto  
**Solução:** Use pelo menos 10 caracteres

### Erro: "Protocolo inválido"
**Causa:** Formato do protocolo incorreto  
**Solução:** Use formato `AAAA-XXXXXX` (ex: `2025-ABC123`)

### Erro: "ID inválido"
**Causa:** Usando número em vez de UUID  
**Solução:** Use UUIDs (strings): `'aa8e1f15-7977-473a-a049-2a74b90f8ef6'`

### Erro: "Para relatos identificados, informe pelo menos email ou telefone"
**Causa:** `is_anonymous: false` mas sem `contact_email` ou `contact_phone`  
**Solução:** Forneça pelo menos um contato

## Resumo das Mudanças

Todos os campos foram alinhados com o que o backend espera. Agora os serviços devem funcionar corretamente.

