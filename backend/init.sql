-- Script de inicialização do banco de dados
-- Executado automaticamente pelo Docker na primeira inicialização

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum para tipo de usuário
CREATE TYPE tipo_usuario AS ENUM ('ADMIN_MASTER', 'OPERADOR');

-- Enum para status de relato
CREATE TYPE status_relato AS ENUM ('NOVO', 'EM_ANDAMENTO', 'FINALIZADO');

-- Enum para prioridade
CREATE TYPE prioridade_relato AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- Enum para tipo de evento
CREATE TYPE tipo_evento AS ENUM (
  'CRIADO',
  'INICIADO',
  'TRANSFERIDO',
  'COMENTARIO_ADICIONADO',
  'RESPOSTA_ENVIADA',
  'ANEXO_ADICIONADO',
  'FINALIZADO',
  'REABERTO'
);

-- Tabela de usuários (operadores e admins)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  tipo tipo_usuario NOT NULL DEFAULT 'OPERADOR',
  ativo BOOLEAN NOT NULL DEFAULT true,
  comite_id UUID,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  deletado_em TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email) WHERE deletado_em IS NULL;
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo) WHERE deletado_em IS NULL;

-- Tabela de comitês
CREATE TABLE comites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  deletado_em TIMESTAMP
);

-- Adicionar FK após criar tabela comites
ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_comite 
  FOREIGN KEY (comite_id) REFERENCES comites(id);

-- Tabela de relatos
CREATE TABLE relatos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocolo VARCHAR(20) UNIQUE NOT NULL,
  
  -- Informações do denunciante (opcional)
  identificado BOOLEAN NOT NULL DEFAULT false,
  denunciante_nome VARCHAR(255),
  denunciante_email VARCHAR(255),
  denunciante_telefone VARCHAR(20),
  denunciante_relacao VARCHAR(100),
  
  -- Email anônimo para notificações (quando não identificado)
  email_notificacao VARCHAR(255),
  
  -- Tipo de relato
  tipo_relato VARCHAR(100) NOT NULL,
  tipo_relato_outro TEXT,
  
  -- Conteúdo da denúncia
  descricao TEXT NOT NULL,
  pessoas_envolvidas TEXT,
  quem_sabe TEXT,
  
  -- Evidências
  possui_evidencias BOOLEAN NOT NULL DEFAULT false,
  
  -- Status e atribuição
  status status_relato NOT NULL DEFAULT 'NOVO',
  prioridade prioridade_relato NOT NULL DEFAULT 'MEDIA',
  comite_id UUID REFERENCES comites(id),
  responsavel_id UUID REFERENCES usuarios(id),
  
  -- Resposta final
  resposta_final TEXT,
  respondido_em TIMESTAMP,
  respondido_por UUID REFERENCES usuarios(id),
  
  -- LGPD
  consentimento_lgpd BOOLEAN NOT NULL DEFAULT false,
  consentimento_versao VARCHAR(20),
  consentimento_ip INET,
  consentimento_em TIMESTAMP,
  
  -- Auditoria
  ip_origem INET,
  user_agent TEXT,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  deletado_em TIMESTAMP
);

CREATE INDEX idx_relatos_protocolo ON relatos(protocolo);
CREATE INDEX idx_relatos_status ON relatos(status) WHERE deletado_em IS NULL;
CREATE INDEX idx_relatos_comite ON relatos(comite_id) WHERE deletado_em IS NULL;
CREATE INDEX idx_relatos_criado_em ON relatos(criado_em DESC);
CREATE INDEX idx_relatos_email_notificacao ON relatos(email_notificacao) WHERE email_notificacao IS NOT NULL;

-- Tabela de anexos
CREATE TABLE anexos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relato_id UUID NOT NULL REFERENCES relatos(id) ON DELETE CASCADE,
  nome_original VARCHAR(255) NOT NULL,
  nome_arquivo VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  tamanho BIGINT NOT NULL,
  caminho TEXT NOT NULL,
  hash_sha256 VARCHAR(64) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  deletado_em TIMESTAMP
);

CREATE INDEX idx_anexos_relato ON anexos(relato_id) WHERE deletado_em IS NULL;

-- Tabela de eventos do relato (histórico/timeline)
CREATE TABLE relato_eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relato_id UUID NOT NULL REFERENCES relatos(id) ON DELETE CASCADE,
  tipo tipo_evento NOT NULL,
  descricao TEXT NOT NULL,
  usuario_id UUID REFERENCES usuarios(id),
  metadados JSONB,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eventos_relato ON relato_eventos(relato_id);
CREATE INDEX idx_eventos_criado_em ON relato_eventos(criado_em DESC);

-- Tabela de comentários internos (comunicação entre equipe)
CREATE TABLE comentarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relato_id UUID NOT NULL REFERENCES relatos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  texto TEXT NOT NULL,
  interno BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  deletado_em TIMESTAMP
);

CREATE INDEX idx_comentarios_relato ON comentarios(relato_id) WHERE deletado_em IS NULL;

-- Tabela de mensagens públicas (denunciante <-> equipe)
CREATE TABLE mensagens_publicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relato_id UUID NOT NULL REFERENCES relatos(id) ON DELETE CASCADE,
  remetente_tipo VARCHAR(20) NOT NULL, -- 'DENUNCIANTE' ou 'EQUIPE'
  usuario_id UUID REFERENCES usuarios(id), -- NULL se for denunciante
  texto TEXT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  lida_em TIMESTAMP
);

CREATE INDEX idx_mensagens_relato ON mensagens_publicas(relato_id);
CREATE INDEX idx_mensagens_criado_em ON mensagens_publicas(criado_em DESC);

-- Tabela de tokens de magic link
CREATE TABLE magic_link_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  usado BOOLEAN NOT NULL DEFAULT false,
  usado_em TIMESTAMP,
  ip_origem INET NOT NULL,
  user_agent TEXT,
  expira_em TIMESTAMP NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_magic_link_email ON magic_link_tokens(email);
CREATE INDEX idx_magic_link_token ON magic_link_tokens(token_hash) WHERE NOT usado;
CREATE INDEX idx_magic_link_expira ON magic_link_tokens(expira_em);

-- Tabela de refresh tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  ip INET NOT NULL,
  user_agent TEXT,
  device_fingerprint VARCHAR(64),
  revogado BOOLEAN NOT NULL DEFAULT false,
  revogado_em TIMESTAMP,
  expira_em TIMESTAMP NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_usuario ON refresh_tokens(usuario_id) WHERE NOT revogado;
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token_hash) WHERE NOT revogado;

-- Tabela de auditoria (imutável)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entidade VARCHAR(50) NOT NULL,
  entidade_id UUID NOT NULL,
  acao VARCHAR(50) NOT NULL,
  usuario_id UUID REFERENCES usuarios(id),
  dados_antes JSONB,
  dados_depois JSONB,
  ip INET,
  user_agent TEXT,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_entidade ON audit_log(entidade, entidade_id);
CREATE INDEX idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_criado_em ON audit_log(criado_em DESC);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relatos_updated_at BEFORE UPDATE ON relatos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comentarios_updated_at BEFORE UPDATE ON comentarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comites_updated_at BEFORE UPDATE ON comites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar protocolo único
CREATE OR REPLACE FUNCTION gerar_protocolo()
RETURNS VARCHAR AS $$
DECLARE
  ano VARCHAR(4);
  chars VARCHAR(36) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- sem I, O, 0, 1
  protocolo VARCHAR(20);
  existe BOOLEAN;
BEGIN
  ano := EXTRACT(YEAR FROM NOW())::VARCHAR;
  
  LOOP
    protocolo := ano || '-' || 
      substring(chars from floor(random() * length(chars) + 1)::int for 1) ||
      substring(chars from floor(random() * length(chars) + 1)::int for 1) ||
      substring(chars from floor(random() * length(chars) + 1)::int for 1) ||
      substring(chars from floor(random() * length(chars) + 1)::int for 1) ||
      substring(chars from floor(random() * length(chars) + 1)::int for 1) ||
      substring(chars from floor(random() * length(chars) + 1)::int for 1);
    
    SELECT EXISTS(SELECT 1 FROM relatos WHERE relatos.protocolo = protocolo) INTO existe;
    
    EXIT WHEN NOT existe;
  END LOOP;
  
  RETURN protocolo;
END;
$$ LANGUAGE plpgsql;

-- Dados iniciais (seed)

-- Criar comitê padrão
INSERT INTO comites (id, nome, descricao, ativo)
VALUES 
  (uuid_generate_v4(), 'Comitê Executivo', 'Comitê principal para análise de denúncias', true),
  (uuid_generate_v4(), 'Comitê Jurídico', 'Análise de questões legais e compliance', true),
  (uuid_generate_v4(), 'Comitê de Diversidade', 'Casos relacionados a discriminação e diversidade', true);

-- Criar usuário admin master (senha será definida via magic link)
INSERT INTO usuarios (nome, email, tipo, ativo)
VALUES 
  ('Administrador Master', 'admin@ouvidoria.com', 'ADMIN_MASTER', true);

COMMENT ON DATABASE canal_ouvidoria IS 'Sistema de Ouvidoria - Canal de Denúncias';



