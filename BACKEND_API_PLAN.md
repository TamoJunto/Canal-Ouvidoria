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
- `magic_link_tokens` (id, usuario_id, token_hash, expira_em, usado, ip_origem, user_agent, criado_em).
- `comites` (id, nome, status, criado_por, atualizado_em).
- `comite_membros` (comite_id, usuario_id, papel[COORDENADOR|MEMBRO]).
- `relatos` (id, protocolo, status[NOVO|EM_ANDAMENTO|RESPONDIDO|FINALIZADO|REABERTO], tipo_relato, descricao, pessoas_envolvidas, conhecimento_fatos, identificacao_tipo[IDENTIFICADO|ANONIMO], nome_denunciante, email_denunciante, telefone_denunciante, relacao, relacao_outros, possui_evidencia, comite_atual_id, criado_em).
- `relato_eventos` (id, relato_id, tipo_evento[STATUS_ATUALIZADO|COMENTARIO|TRANSFERENCIA|RESPOSTA_FINAL|MENSAGEM_PUBLICA], payload_json, criado_por_tipo[SISTEMA|USUARIO|DENUNCIANTE], criado_por_id/null, criado_em).
- `relato_mensagens` (id, relato_id, origem[DENUNCIANTE|EQUIPE], conteudo, anexos_count, criado_em).
- `anexos` (id, relato_id, bucket_key, nome_original, tipo_mime, tamanho_bytes, origem[DENUNCIANTE|EQUIPE], criado_em).
- `tokens_acesso` (id, usuario_id, refresh_token_hash, expira_em, revogado).
- `audit_log` (id, entidade, entidade_id, acao, payload_diff, ip, user_agent, usuario_id/null, criado_em).

> Observações:  
> - Protocolo pode ser `AAA-111` (3 letras + hífen + 3 caracteres base32).  
> - Guardar campos de contato mesmos quando anônimo (quando fornecido voluntariamente).  
> - `relato_eventos` funciona como trilha única consumida pela UI (comentários, respostas, histórico).  
> - **Autenticação**: Sistema passwordless via Magic Link. Email não precisa ter domínio específico; tipo de usuário (ADMIN_MASTER/OPERADOR) é definido no cadastro/configuração, não pelo email.

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

## 6. Regras de negócios e validações
- **LGPD**: armazenar consentimento e permitir remoção de dados pessoais identificáveis quando solicitado (exceto logs obrigatórios).  
- **Protocolo único**: índice único + validação case-insensitive.  
- **Magic Link**: 
  - Token válido por 15 minutos após envio.
  - Token só pode ser usado uma vez (marca como `usado` após validação).
  - Rate limit: máximo 3 solicitações de link por email por hora.
  - Email deve estar cadastrado e usuário ativo para receber link.
  - Tipo de usuário (ADMIN_MASTER/OPERADOR) é definido no cadastro, não pelo email.
- **Transferência**: só Admin Master pode trocar `comite`; operador visualiza apenas comitês onde é membro.  
- **Comentários**: flag `visibilidade` (`INTERNO` x `PUBLICO`) para reusar endpoint.  
- **Mensagens públicas**: limitadas por taxa (ex.: 5 mensagens/relato/dia) para evitar spam.  
- **Uploads**: limite 25 MB por arquivo, extensões seguras, antivírus (ClamAV) em segundo plano.  
- **Auditoria**: toda ação autenticada grava IP, user agent, horário.  
- **Notificações**: e-mail opcional ao denunciante quando relato muda para `RESPONDIDO/FINALIZADO` ou quando equipe responde mensagem.

## 7. Segurança
- JWT assinado (RS256). Tokens com escopo `role`.  
- **Magic Link**: 
  - Tokens gerados com criptografia segura (ex.: SHA-256 + salt único).
  - Tokens armazenados como hash no banco (nunca em texto plano).
  - Validação de expiração e uso único.
  - Rate limiting por email (3 tentativas/hora) para prevenir enumeração de emails.
  - Logs de tentativas de uso de tokens inválidos/expirados.
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

## 9. Roadmap de implementação
1. **MVP**: módulos `Auth`, `Relatos`, `Public`. Sem fila; anexos em disco local.  
2. **Fase 2**: Comitês/Usuários completos, notificações e dashboards.  
3. **Fase 3**: Filas, antivírus, integrações externas (PowerBI, SSO).  
4. **Fase 4**: Observabilidade avançada e hardening LGPD (anonimização automática).

---
Este documento serve como base para validar com o time sênior e ajustar antes do desenvolvimento.

