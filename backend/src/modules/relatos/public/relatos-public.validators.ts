import { z } from 'zod';

const ReportTypeEnum = z.enum([
  'COMPORTAMENTO_INADEQUADO',
  'ASSEDIO_MORAL',
  'CONFLITO_INTERESSES',
  'CORRUPCAO',
  'ASSEDIO_SEXUAL',
  'PRECONCEITO_DISCRIMINACAO',
  'OUTROS',
]);

export const createReportSchema = z.object({
  body: z.object({
    description: z.string()
      .min(10, 'Descrição deve ter no mínimo 10 caracteres')
      .max(5000, 'Descrição muito longa'),
    
    type: ReportTypeEnum,
    
    involved_people: z.string().optional(),
    
    has_evidence: z.boolean().optional().default(false),
    
    is_anonymous: z.boolean().optional().default(false),
    
    // Dados de contato (opcionais se anônimo)
    name: z.string().max(255).optional(),
    contact_email: z.string().email('Email inválido').optional().or(z.literal('')),
    contact_phone: z.string().max(20).optional(),
  }).refine((data) => {
    // Se identificado, deve ter pelo menos email OU telefone
    if (!data.is_anonymous) {
      const hasEmail = data.contact_email && data.contact_email.trim() !== '';
      const hasPhone = data.contact_phone && data.contact_phone.trim() !== '';
      return hasEmail || hasPhone;
    }
    return true;
  }, {
    message: 'Para relatos identificados, informe pelo menos email ou telefone',
    path: ['contact_email'],
  }),
});

export const getReportSchema = z.object({
  params: z.object({
    protocol: z.string()
      .min(4, 'Protocolo inválido')
      .regex(/^\d{4}-[A-Z0-9]{6}$/, 'Formato de protocolo inválido (esperado: AAAA-XXXXXX)'),
  }),
  query: z.object({}).optional(),
  body: z.object({}).optional(),
});

export const createMessageSchema = z.object({
  params: z.object({
    protocol: z.string()
      .min(4, 'Protocolo inválido')
      .regex(/^\d{4}-[A-Z0-9]{6}$/, 'Formato de protocolo inválido (esperado: AAAA-XXXXXX)'),
  }),
  body: z.object({
    content: z.string()
      .min(1, 'Mensagem não pode estar vazia')
      .max(2000, 'Mensagem muito longa'),
  }),
});