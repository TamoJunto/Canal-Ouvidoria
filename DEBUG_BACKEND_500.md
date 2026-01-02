# Debug: Erro 500 no Backend ao Buscar Relato

## Problema Identificado

Ao buscar o protocolo `2025-D674GB`, o backend está retornando erro 500.

## Possíveis Causas

### 1. Tabela `relato_eventos` não existe

O código tenta buscar dados de `relato_eventos`:

```sql
SELECT *
FROM relato_eventos
WHERE relato_id = $1 
  AND tipo_evento IN ('MENSAGEM_PUBLICA', 'RESPOSTA_FINAL')
ORDER BY criado_em ASC
```

**Verifique se a tabela existe:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'relato_eventos';
```

### 2. Campo `payload_json` não existe ou é inválido

O código tenta mapear `event.payload_json` que pode não existir.

**Verifique a estrutura da tabela:**
```sql
\d relato_eventos
```

### 3. Relato existe mas tem dados incompletos

**Verifique o relato no banco:**
```sql
SELECT id, protocolo, descricao, tipo_relato, status
FROM relatos
WHERE protocolo = '2025-D674GB';
```

## Solução Temporária no Backend

No arquivo `backend/src/modules/relatos/public/relatos-public.service.ts`, linha 56-79:

```typescript
async getReportStatus(protocol: string) {
  const report = await this.repository.findByProtocol(protocol);
  
  if (!report) {
    throw new AppError('Protocolo não encontrado', 404, 'PROTOCOL_NOT_FOUND');
  }
  
  let timeline = [];
  try {
    timeline = await this.repository.getPublicTimeline(report.id);
  } catch (error) {
    logger.error({ error, reportId: report.id }, 'Erro ao buscar timeline, retornando vazio');
    // Continua sem a timeline se houver erro
  }
  
  return {
    success: true,
    protocol: report.protocol,
    status: report.status,
    description: report.description,
    type: report.type,
    created_at: report.created_at,
    updated_at: report.updated_at,
    timeline: timeline.map((event) => ({
      type: event.tipo_evento,
      content: event.payload_json,
      timestamp: event.criado_em,
    })),
  };
}
```

## Verificação Completa

Execute no PostgreSQL:

```sql
-- 1. Verificar se o relato existe
SELECT * FROM relatos WHERE protocolo = '2025-D674GB';

-- 2. Verificar se a tabela relato_eventos existe
SELECT COUNT(*) FROM relato_eventos;

-- 3. Verificar eventos desse relato
SELECT re.* 
FROM relato_eventos re
JOIN relatos r ON r.id = re.relato_id
WHERE r.protocolo = '2025-D674GB';

-- 4. Verificar estrutura das tabelas
\d relatos
\d relato_eventos
```

## Logs do Backend

Procure no console do backend por mensagens de erro mais detalhadas que mostrem:
- O erro SQL exato
- A linha do código onde falhou
- Detalhes sobre o que causou o erro 500

## Teste Direto

Teste usando cURL para ver o erro completo:

```bash
curl http://localhost:3001/api/public/relatos/2025-D674GB
```

Isso mostrará a resposta de erro completa do backend.

