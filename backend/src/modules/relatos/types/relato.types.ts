export type ReportType =
  | 'COMPORTAMENTO_INADEQUADO'
  | 'ASSEDIO_MORAL'
  | 'CONFLITO_INTERESSES'
  | 'CORRUPCAO'
  | 'ASSEDIO_SEXUAL'
  | 'PRECONCEITO_DISCRIMINACAO'
  | 'OUTROS';

export type ReportStatus = 
  | 'NOVO' 
  | 'EM_ANDAMENTO' 
  | 'RESPONDIDO' 
  | 'FINALIZADO' 
  | 'REABERTO';

export type ReportPriority = 
  | 'BAIXA' 
  | 'NORMAL' 
  | 'ALTA' 
  | 'URGENTE';

export interface Report {
  id: string;
  protocol: string;
  description: string;
  type: ReportType;
  involved_people?: string;
  has_evidence: boolean;
  is_identified: boolean;
  
  // Dados de contato
  reporter_name?: string | null;
  reporter_email?: string | null;
  reporter_phone?: string | null;
  notification_email?: string | null;
  
  status: ReportStatus;
  priority: ReportPriority;
  
  created_at: Date;
  updated_at: Date;
}

export interface CreateReportDTO {
  description: string;
  type: ReportType;
  involved_people?: string;
  has_evidence?: boolean;
  is_anonymous: boolean;
  
  // Dados de contato (opcionais)
  name?: string;
  contact_email?: string;
  contact_phone?: string;
}