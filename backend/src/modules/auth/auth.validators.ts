import { z } from 'zod';

/**
 * Schema para solicitar magic link
 */
export const requestMagicLinkSchema = z.object({
  email: z
    .string({
      required_error: 'Email é obrigatório',
    })
    .email('Email inválido')
    .toLowerCase()
    .trim(),
});

export type RequestMagicLinkInput = z.infer<typeof requestMagicLinkSchema>;

/**
 * Schema para verificar magic link
 */
export const verifyMagicLinkSchema = z.object({
  token: z
    .string({
      required_error: 'Token é obrigatório',
    })
    .min(64, 'Token inválido')
    .max(64, 'Token inválido'),
});

export type VerifyMagicLinkInput = z.infer<typeof verifyMagicLinkSchema>;

/**
 * Schema para refresh token
 */
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({
      required_error: 'Refresh token é obrigatório',
    })
    .min(1, 'Refresh token não pode ser vazio'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

/**
 * Schema para logout
 */
export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export type LogoutInput = z.infer<typeof logoutSchema>;



