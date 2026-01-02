import { z } from 'zod';

export const createComiteSchema = z.object({
  body: z.object({
    nome: z.string()
      .min(2, 'Nome deve ter no mínimo 2 caracteres')
      .max(100, 'Nome muito longo'),
    descricao: z.string()
      .max(500, 'Descrição muito longa')
      .optional()
      .nullable(),
  }),
});

export const updateComiteSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    nome: z.string()
      .min(2, 'Nome deve ter no mínimo 2 caracteres')
      .max(100, 'Nome muito longo')
      .optional(),
    descricao: z.string()
      .max(500, 'Descrição muito longa')
      .optional()
      .nullable(),
  }),
});

export const getComiteSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});

export const addMembroSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID do comitê inválido'),
  }),
  body: z.object({
    usuarioId: z.string().uuid('ID do usuário inválido'),
  }),
});

export const removeMembroSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID do comitê inválido'),
    usuarioId: z.string().uuid('ID do usuário inválido'),
  }),
});