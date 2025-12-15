# Plano de Backend e API – Sistema de Ouvidoria Canal

## 1. Objetivos do backend
- Registrar relatos (inclusive anônimos) com geração de protocolo rastreável.
- Controlar tratamento interno (comentários, transferências, respostas finais).
- Permitir acompanhamento público via protocolo.
- Garantir segregação de perfis (Admin Master x Operador) e trilha de auditoria.
- Servir dashboards e integrações futuras (BI, notificações, SSO interno).

## 2. Arquitetura sugerida
| Camada | Sugestão | Observações |
| --- | --- | --- |
| API | NestJS (Express adapter) + Zod/Joi | Estrutura modular ajuda a isolar domínios (Relatos, Usuários, Comitês, Dashboards). |
| Banco | PostgreSQL 15 | Suporte a JSONB (metadados), FTS se precisar buscar relatos. |
| Armazenamento de anexos | S3 compatível (Wasabi/MinIO/Azure Blob) | Guardar apenas metadata no banco. |
| Fila/Eventos | BullMQ + Redis (opcional fase 2) | Envio assíncrono de notificações / escalas. |
| Autenticação | JWT + Refresh, Magic Link (passwordless) | Login via link enviado por email. Sem senhas. Possível integração futura com IdP corporativo. |
| Infra | Docker Compose local → Kubernetes/Containers na nuvem | API stateless; anexos em blob storage. |

## 3. Modelo de dados (tabelas principais)
- `usuarios` (id, nome, email, tipo_usuario[ADMIN_MASTER|OPERADOR], status, ultimo_login, criado_em).
- `magic_link_tokens` (id, usuario_id, token_hash, expira_em, usado, ip_origem, user_agent, ip_validacao, validado_em, device_fingerprint, criado_em).
- `comites` (id, nome, status, criado_por, atualizado_em).
- `comite_membros` (comite_id, usuario_id, papel[COORDENADOR|MEMBRO]).
- `relatos` (id, protocolo, status[NOVO|EM_ANDAMENTO|RESPONDIDO|FINALIZADO|REABERTO], tipo_relato, descricao, pessoas_envolvidas, conhecimento_fatos, identificacao_tipo[IDENTIFICADO|ANONIMO], nome_denunciante, email_denunciante, telefone_denunciante, relacao, relacao_outros, possui_evidencia, comite_atual_id, prioridade[BAIXA|NORMAL|ALTA|URGENTE], prazo_resposta_dias, data_limite, criado_por_ip, deletado_em, criado_em).
- `relato_eventos` (id, relato_id, tipo_evento[STATUS_ATUALIZADO|COMENTARIO|TRANSFERENCIA|RESPOSTA_FINAL|MENSAGEM_PUBLICA], payload_json, criado_por_tipo[SISTEMA|USUARIO|DENUNCIANTE], criado_por_id/null, criado_em).
- `relato_mensagens` (id, relato_id, origem[DENUNCIANTE|EQUIPE], conteudo, anexos_count, criado_em).
- `anexos` (id, relato_id, bucket_key, nome_original, tipo_mime, tamanho_bytes, origem[DENUNCIANTE|EQUIPE], criado_em).
- `tokens_acesso` (id, usuario_id, refresh_token_hash, expira_em, revogado).
- `audit_log` (id, entidade, entidade_id, acao, payload_diff, ip, user_agent, usuario_id/null, criado_em).
- `consentimentos_lgpd` (id, relato_id, versao_termo, ip_aceite, aceito_em).
- `notificacoes` (id, relato_id, tipo, canal[EMAIL|SMS|PUSH|WHATSAPP], destinatario, status[PENDENTE|ENVIADO|ERRO|ENTREGUE], tentativas, erro_mensagem, enviado_em, criado_em).

> Observações:
> - **Protocolo**: Formato sugerido `2025-ABC123` (ano + hífen + 6 caracteres alfanuméricos) para evitar colisões. Índice único case-insensitive.
> - Guardar campos de contato mesmos quando anônimo (quando fornecido voluntariamente).
> - `relato_eventos` funciona como trilha única consumida pela UI (comentários, respostas, histórico).
> - **Autenticação**: Sistema passwordless via Magic Link. Email não precisa ter domínio específico; tipo de usuário (ADMIN_MASTER/OPERADOR) é definido no cadastro/configuração, não pelo email.
> - **Prioridade**: Calculada automaticamente baseada em palavras-chave ou definida manualmente.
> - **Soft Delete**: Campo `deletado_em` permite recuperação e conformidade com LGPD.
> - **Anexos**: Limite total por relato de 100MB. Validação MIME real, não apenas extensão.
> - **Magic Link aprimorado**: Registra IP e device fingerprint na validação para segurança adicional.

## 4. Fluxos principais
### 4.1 Criação de relato (público)
1. `POST /public/relatos` grava relato, gera protocolo e (opcional) salva metadados de upload pendente.
2. Se `possui_evidencia=true`, front redireciona para upload → `POST /public/relatos/{protocolo}/anexos`.
3. API retorna protocolo + instruções. Email opcional recebe notificação (quando fornecido).

### 4.2 Acompanhamento
1. Usuário informa protocolo → `GET /public/relatos/{protocolo}`.
2. Resposta traz status, descrição, linha do tempo pública (comentários enviados ao denunciante + resposta final).
3. Envio de mensagem: `POST /public/relatos/{protocolo}/mensagens`.

### 4.3 Tratamento interno
1. Admin/Operador solicita login informando apenas email (`POST /auth/magic-link`).
2. Sistema envia email com link mágico (válido por 15 minutos).
3. Usuário clica no link → `GET /auth/verify-magic-link?token=xxx` → retorna JWT tokens.
4. Listas de relatos paginadas/filtradas consumem `GET /relatos` (com JWT no header).
5. Ações: iniciar tratamento, transferir para comitê, adicionar comentário, responder, reabrir.
6. Cada ação registra evento + atualiza status conforme regra:
   - `iniciar_tratamento` → `NOVO → EM_ANDAMENTO`.
   - `responder` → `RESPONDIDO` (aguarda confirmação) ou `FINALIZADO`.
   - `reabrir` → `REABERTO` e volta para `EM_ANDAMENTO`.

### 4.4 Gestão de usuários/comitês
- Admin Master cadastra usuários (definindo tipo: ADMIN_MASTER ou OPERADOR), ativa/desativa usuários, configura comitês e membros.
- Email pode ser qualquer domínio; tipo de usuário é definido no cadastro, não pelo email.
- Operador não acessa essas rotas (checagem via RBAC).

## 5. Catálogo de endpoints (versão 0.1)
### 5.1 Autenticação (Magic Link - Passwordless)
- `POST /auth/magic-link` → { email } → envia email com link mágico (resposta: `{ message: "Link enviado" }`).
- `GET /auth/verify-magic-link?token={token}` → valida token e retorna `{ accessToken(15m), refreshToken(7d), user }`.
- `POST /auth/refresh` → refresh token válido → novo par de tokens.
- `POST /auth/logout` → revoga refresh token.
- `POST /auth/resend-magic-link` → { email } → reenvia link (rate limit: 3 tentativas/hora por email).

### 5.2 Público
| Método e rota | Descrição | Payload/resposta |
| --- | --- | --- |
| `POST /public/relatos` | Cria um relato. | Request com dados do formulário; resposta `{ protocolo, status_inicial }`. |
| `POST /public/relatos/{protocolo}/anexos` | Upload multipart (até 10 arquivos). | Retorna metadados armazenados. |
| `GET /public/relatos/{protocolo}` | Consulta status. | `{ protocolo, status, descricao, resposta_final?, timeline_publica[] }`. |
| `POST /public/relatos/{protocolo}/mensagens` | Mensagem adicional. | Retorna confirmação + estimativa de resposta. |

### 5.3 Relatos (área autenticada)
- `GET /relatos` com filtros: `status`, `comiteId`, `tipoRelato`, `search`, paginação.
- `GET /relatos/{id}` → detalhes completos + eventos + anexos internos.
- `POST /relatos/{id}/iniciar` → muda para `EM_ANDAMENTO`.
- `POST /relatos/{id}/transferir` → body { comiteDestinoId, motivo }.
- `POST /relatos/{id}/comentarios` → { conteudo } → evento interno (não exposto ao denunciante).
- `POST /relatos/{id}/resposta-final` → { resposta, anexos? } → muda status `FINALIZADO`, gera versão pública.
- `POST /relatos/{id}/reabrir` → { motivo }.
- `POST /relatos/{id}/anexos` → upload interno (equipe).
- `GET /relatos/{id}/mensagens` | `POST /relatos/{id}/mensagens/{mensagemId}/responder`.

### 5.4 Usuários e comitês (somente Admin Master)
- `GET /usuarios`, `POST /usuarios`, `PUT /usuarios/{id}`, `PATCH /usuarios/{id}/status`.
- `GET /comites`, `POST /comites`, `PUT /comites/{id}`, `PATCH /comites/{id}/status`.
- `POST /comites/{id}/membros` / `DELETE /comites/{id}/membros/{usuarioId}`.

### 5.5 Dashboard/relatórios
- `GET /dashboard/resumo` → KPIs (relatos por status, SLA médio, canais).
- `GET /dashboard/serie-temporal?groupBy=mes`.
- `GET /dashboard/topicos` → categorias mais frequentes.

### 5.6 LGPD e Conformidade
- `POST /public/relatos/{protocolo}/consentimento` → Registra consentimento LGPD com versão do termo, IP e timestamp.
- `POST /relatos/{id}/anonimizar` → Remove dados pessoais mantendo dados estatísticos (Admin Master).
- `GET /public/relatos/{protocolo}/exportar-dados` → Portabilidade de dados (direito LGPD).
- `PATCH /public/relatos/{protocolo}/dados-pessoais` → Retificação de dados pessoais.

### 5.7 Busca e Exportação (Admin/Operador)
- `GET /relatos/search` → Busca avançada com múltiplos filtros (status, comitê, datas, texto livre).
  - Query params: `q`, `status[]`, `comiteId`, `dataInicio`, `dataFim`, `prioridade`, `sort`, `page`, `limit`.
- `GET /relatos/export?formato=csv|xlsx|pdf` → Exporta relatos filtrados (com anonimização).
- `GET /comites/{id}/estatisticas` → Estatísticas por comitê (tempo médio, taxa resolução).

### 5.8 Saúde e Monitoramento
- `GET /health` → Status geral da API.
- `GET /health/ready` → Readiness probe (banco + redis + storage).
- `GET /health/live` → Liveness probe.
- `GET /metrics` → Métricas Prometheus (autenticado).

## 6. Regras de negócios e validações
- **LGPD**:
  - Armazenar consentimento explícito com versão do termo, IP e timestamp.
  - Permitir exportação completa de dados (portabilidade).
  - Permitir retificação de dados pessoais.
  - Anonimização remove dados identificáveis mantendo dados estatísticos.
  - Logs de auditoria obrigatórios são mantidos mesmo após anonimização.

- **Protocolo único**:
  - Formato `AAAA-XXXXXX` (ano + 6 alfanuméricos).
  - Índice único case-insensitive no banco.
  - Geração usando crypto seguro (evitar colisões).

- **Magic Link**:
  - Token válido por 15 minutos após envio.
  - Token só pode ser usado uma vez (marca como `usado` após validação).
  - Tokens armazenados como hash SHA-256 (nunca em texto plano).
  - Rate limit: máximo 3 solicitações de link por email por hora.
  - Rate limit adicional: 10 tentativas por IP por hora.
  - Email deve estar cadastrado e usuário ativo para receber link.
  - Registra IP e device fingerprint na validação.
  - Alerta se IP de validação != IP de solicitação (opcional).
  - Tipo de usuário (ADMIN_MASTER/OPERADOR) é definido no cadastro, não pelo email.
  - Proteção contra timing attacks ao verificar tokens.

- **Prioridade**:
  - Atribuída automaticamente baseada em palavras-chave sensíveis.
  - Pode ser alterada manualmente por Admin Master.
  - Relatos URGENTES notificam coordenadores imediatamente.

- **Transferência**:
  - Só Admin Master pode trocar `comite`.
  - Operador visualiza apenas comitês onde é membro.
  - Transferência registra motivo e mantém histórico completo.

- **Comentários**:
  - Flag `visibilidade` (`INTERNO` x `PUBLICO`) para reusar endpoint.
  - Comentários públicos são notificados ao denunciante.

- **Mensagens públicas**:
  - Limitadas por taxa: 5 mensagens/relato/dia para evitar spam.
  - Rate limit adicional: 20 mensagens/IP/dia.

- **Uploads**:
  - Limite 25 MB por arquivo.
  - Limite total 100 MB por relato.
  - Validação MIME real (não apenas extensão).
  - Extensões permitidas: pdf, jpg, jpeg, png, doc, docx, mp3, mp4, avi.
  - Antivírus (ClamAV) em segundo plano via fila.
  - Arquivos infectados são quarenteados e equipe notificada.
  - Signed URLs com expiração de 5 minutos para download.

- **Rate Limiting Global**:
  - Criação de relatos: 10 relatos/hora por IP.
  - Acompanhamento público: 30 req/min por IP.
  - APIs autenticadas: 100 req/min por usuário.

- **Auditoria**:
  - Toda ação autenticada grava: usuário, IP, user agent, horário, payload diff.
  - Ações sensíveis (transferências, anonimização) geram alertas.
  - Logs são imutáveis e armazenados por no mínimo 5 anos.

- **Notificações**:
  - E-mail ao denunciante quando relato muda para `RESPONDIDO/FINALIZADO`.
  - Notificação quando equipe responde mensagem.
  - Preferências de notificação: TODAS | IMPORTANTES | FINAL.
  - Sistema de retry: 3 tentativas com backoff exponencial.
  - Templates personalizáveis por tipo de notificação.

## 7. Segurança
- JWT assinado (RS256). Tokens com escopo `role`.
- **Magic Link**:
  - Tokens gerados com criptografia segura (ex.: SHA-256 + salt único).
  - Tokens armazenados como hash no banco (nunca em texto plano).
  - Validação de expiração e uso único.
  - Rate limiting por email (3 tentativas/hora) e por IP (10 tentativas/hora).
  - Logs de tentativas de uso de tokens inválidos/expirados.
  - Proteção contra timing attacks (crypto.timingSafeEqual).
- Rate limiting para rotas públicas (ex.: 30 req/min por IP).
- Sanitização/escape de HTML em campos ricos.
- CSP e Signed URLs para anexos (links válidos por 5 min).
- Backups automáticos do banco e storage criptografado (at-rest + transit).
- Segregar ambientes (dev/stage/prod) com variáveis `.env`.

## 8. Observabilidade
- Logs estruturados (Pino) → Loki/ELK.
- Métricas (Prometheus) com painéis de filas, tempo médio de resposta, volume diário.
- Alertas para erros 5xx e filas atrasadas.
- Endpoints críticos cobertos por testes de integração (Supertest) + contratos (Zod).

### 8.1 Métricas Importantes
**Performance:**
- Tempo médio de resposta por endpoint
- P95, P99 de latência
- Taxa de erros 4xx/5xx

**Negócio:**
- Relatos criados por hora/dia
- Tempo médio de resolução por tipo/comitê
- Taxa de reabertura
- Relatos sem atribuição > 24h
- Taxa de conversão (anônimo vs identificado)

**Segurança:**
- Tentativas de magic link inválidas
- Acessos com tokens expirados
- IPs bloqueados por rate limit
- Uploads rejeitados por antivírus

**Sistema:**
- Tamanho da fila de processamento
- Uso de storage (anexos)
- Conexões ao banco
- Cache hit rate

## 9. Estratégia de Testes
### 9.1 Testes Unitários (70%)
- Validações de domínio
- Geração de protocolos
- Regras de negócio
- Helpers e utilitários

### 9.2 Testes de Integração (25%)
- Fluxos de API completos
- Interação com banco
- Autenticação/autorização
- Upload de arquivos

### 9.3 Testes E2E (5%)
Jornadas críticas:
- Criação de relato anônimo completo
- Login via magic link + tratamento de relato
- Transferência entre comitês
- Acompanhamento público

### 9.4 Fixtures e Seeds
- Dados de teste consistentes
- Factory patterns para entidades
- Limpar banco entre testes

## 10. Infraestrutura e Docker
### 10.1 Docker Compose (Desenvolvimento)
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ouvidoria
      POSTGRES_USER: canal
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  minio:  # S3 compatível para desenvolvimento
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    command: server /data --console-address ":9001"

  mailhog:  # Servidor SMTP para testes
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_data:
  redis_data:
```

## 11. Padrões Arquiteturais Recomendados
### 11.1 CQRS para Relatórios
Separar queries (leitura) de commands (escrita) para melhor performance.

### 11.2 Event Sourcing para Auditoria
Manter histórico completo de eventos do domínio.

### 11.3 Repository Pattern
Abstrair acesso a dados e facilitar testes.

### 11.4 Value Objects
Criar objetos imutáveis para conceitos de domínio (Protocolo, Email, etc).

## 12. Checklist Pré-Desenvolvimento
- [ ] Definir convenções de código (ESLint, Prettier)
- [ ] Setup de ambiente com Docker
- [ ] CI/CD pipeline (GitHub Actions/GitLab CI)
- [ ] Documentação OpenAPI/Swagger
- [ ] Variáveis de ambiente documentadas
- [ ] Estratégia de migrations (TypeORM/Prisma/Knex)
- [ ] Configurar Sentry ou similar para monitoramento de erros
- [ ] Definir SLAs e tempos de resposta esperados
- [ ] Política de backup e disaster recovery
- [ ] Plano de rollback para deploys

## 13. Roadmap de implementação
1. **MVP (Fase 1 - 4 semanas)**:
   - Módulos `Auth` (Magic Link), `Relatos`, `Public`.
   - Anexos em disco local ou MinIO.
   - Sem fila (processamento síncrono).

2. **Fase 2 (3 semanas)**:
   - Comitês/Usuários completos com RBAC.
   - Sistema de notificações por email.
   - Dashboards básicos.

3. **Fase 3 (3 semanas)**:
   - BullMQ + Redis para filas.
   - Antivírus (ClamAV) assíncrono.
   - Integrações externas (PowerBI, SSO).

4. **Fase 4 (2 semanas)**:
   - Observabilidade avançada (Prometheus, Grafana).
   - Hardening LGPD (anonimização automática).
   - Otimizações de performance.

---
Este documento serve como base para validar com o time sênior e ajustar antes do desenvolvimento.
