import { z } from 'zod';

export const addComentarioSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    conteudo: z.string()
      .min(1, 'Comentário não pode estar vazio')
      .max(5000, 'Comentário muito longo'),
  }),
});

export const transferirSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    comiteId: z.string().uuid('ID do comitê inválido'),
    motivo: z.string()
      .min(1, 'Motivo não pode estar vazio')
      .max(500, 'Motivo muito longo'),
  }),
});

export const responderSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    resposta: z.string()
      .min(10, 'Resposta deve ter no mínimo 10 caracteres')
      .max(5000, 'Resposta muito longa'),
  }),
});

export const reabrirSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    motivo: z.string()
      .min(10, 'Motivo deve ter no mínimo 10 caracteres')
      .max(500, 'Motivo muito longo'),
  }),
});

export const getRelatoSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});