import { z } from 'zod';

export const createUsuarioSchema = z.object({
  body: z.object({
    nome: z.string()
      .min(2, 'Nome deve ter no mínimo 2 caracteres')
      .max(100, 'Nome muito longo'),
    email: z.string()
      .email('Email inválido'),
    tipo: z.enum(['ADMIN_MASTER', 'OPERADOR'], {
      errorMap: () => ({ message: 'Tipo deve ser ADMIN_MASTER ou OPERADOR' })
    }),
    comiteId: z.string().uuid('ID do comitê inválido').optional().nullable(),
  }),
});

export const updateUsuarioSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    nome: z.string()
      .min(2, 'Nome deve ter no mínimo 2 caracteres')
      .max(100, 'Nome muito longo')
      .optional(),
    email: z.string()
      .email('Email inválido')
      .optional(),
    tipo: z.enum(['ADMIN_MASTER', 'OPERADOR'], {
      errorMap: () => ({ message: 'Tipo deve ser ADMIN_MASTER ou OPERADOR' })
    }).optional(),
    comiteId: z.string().uuid('ID do comitê inválido').optional().nullable(),
  }),
});

export const getUsuarioSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});