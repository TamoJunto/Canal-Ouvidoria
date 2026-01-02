/**
 * Tipos TypeScript para as APIs do backend
 */

// AUTH
export interface MagicLinkRequest {
  email: string;
}

export interface MagicLinkResponse {
  success: boolean;
  message: string;
}

export interface VerifyMagicLinkResponse {
  success: boolean;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: {
    id: string;
    nome: string;
    email: string;
    tipo: 'ADMIN_MASTER' | 'OPERADOR';
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'OPERADOR' | 'ADMIN_MASTER';
  ativo: boolean;
  comites?: Comite[];
  criado_em: string;
  atualizado_em: string;
}

// RELATOS PÚBLICOS
export interface CreateRelatoRequest {
  type: 'COMPORTAMENTO_INADEQUADO' | 'ASSEDIO_MORAL' | 'CONFLITO_INTERESSES' | 'CORRUPCAO' | 'ASSEDIO_SEXUAL' | 'PRECONCEITO_DISCRIMINACAO' | 'OUTROS';
  description: string;
  is_anonymous: boolean;
  name?: string;
  contact_email?: string;
  contact_phone?: string;
  involved_people?: string;
  has_evidence?: boolean;
}

export interface CreateRelatoResponse {
  success: boolean;
  protocol: string;
  message: string;
  status: string;
  created_at: string;
}

export interface RelatoPublico {
  success: boolean;
  protocol: string;
  status: string;
  description: string;
  type: string;
  created_at: string;
  updated_at: string;
  timeline: Array<{
    type: string;
    content: any;
    timestamp: string;
  }>;
}

export interface Mensagem {
  id: number;
  texto: string;
  remetente_tipo: 'DENUNCIANTE' | 'SISTEMA' | 'OPERADOR';
  remetente_nome?: string;
  criado_em: string;
}

export interface CreateMensagemRequest {
  content: string;
}

export interface Anexo {
  id: number;
  nome_original: string;
  tipo_mime: string;
  tamanho: number;
  criado_em: string;
}

// RELATOS AUTENTICADOS
export interface RelatoDetalhado {
  id: number;
  protocolo: string;
  tipo: string;
  assunto?: string;
  descricao: string;
  status: string;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  anonimo: boolean;
  contato_nome?: string;
  contato_email?: string;
  contato_telefone?: string;
  data_ocorrencia?: string;
  local_ocorrencia?: string;
  envolvidos?: string;
  testemunhas?: string;
  evidencias?: string;
  comite?: Comite;
  operador_responsavel?: Usuario;
  criado_em: string;
  atualizado_em: string;
  iniciado_em?: string;
  finalizado_em?: string;
  mensagens: Mensagem[];
  comentarios: Comentario[];
  historico: HistoricoItem[];
  anexos: Anexo[];
}

export interface Comentario {
  id: number;
  texto: string;
  usuario: {
    id: number;
    nome: string;
  };
  criado_em: string;
}

export interface HistoricoItem {
  id: number;
  acao: string;
  detalhes?: string;
  usuario?: {
    id: number;
    nome: string;
  };
  criado_em: string;
}

export interface ListarRelatosParams {
  page?: number;
  limit?: number;
  status?: string;
  tipo?: string;
  prioridade?: string;
  comite_id?: number;
  operador_id?: number;
  data_inicio?: string;
  data_fim?: string;
  busca?: string;
}

export interface ListarRelatosResponse {
  success: boolean;
  data: RelatoDetalhado[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AddComentarioRequest {
  conteudo: string;
}

export interface TransferirRelatoRequest {
  comiteId: string;
  motivo: string;
}

export interface ResponderRelatoRequest {
  resposta: string;
}

export interface ReabrirRelatoRequest {
  motivo: string;
}

// USUÁRIOS
export interface CreateUsuarioRequest {
  nome: string;
  email: string;
  tipo: 'OPERADOR' | 'ADMIN_MASTER';
  comiteId?: string | null;
}

export interface UpdateUsuarioRequest {
  nome?: string;
  email?: string;
  tipo?: 'OPERADOR' | 'ADMIN_MASTER';
  comiteId?: string | null;
}

export interface ListarUsuariosResponse {
  success: boolean;
  data: Usuario[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// COMITÊS
export interface Comite {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  membros?: Usuario[];
  criado_em: string;
  atualizado_em: string;
}

export interface CreateComiteRequest {
  nome: string;
  descricao?: string;
}

export interface UpdateComiteRequest {
  nome?: string;
  descricao?: string;
}

export interface AddMembroRequest {
  usuarioId: string;
}

export interface ListarComitesResponse {
  success: boolean;
  data: Comite[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// DASHBOARD
export interface DashboardData {
  kpis: {
    total_relatos: number;
    novos: number;
    em_andamento: number;
    finalizados: number;
    tempo_medio_resolucao: number;
  };
  por_status: {
    status: string;
    quantidade: number;
    percentual: number;
  }[];
  por_tipo: {
    tipo: string;
    quantidade: number;
  }[];
  por_prioridade: {
    prioridade: string;
    quantidade: number;
  }[];
  por_comite: {
    comite: string;
    quantidade: number;
  }[];
  por_periodo: {
    mes: string;
    quantidade: number;
  }[];
}

export interface DashboardKPIs {
  total_relatos: number;
  novos: number;
  em_andamento: number;
  finalizados: number;
  tempo_medio_resolucao: number;
}

// RESPOSTAS GENÉRICAS
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  paginacao: {
    total: number;
    pagina_atual: number;
    total_paginas: number;
    limite: number;
  };
}

