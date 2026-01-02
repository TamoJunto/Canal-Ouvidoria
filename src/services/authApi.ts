import { apiClient, tokenManager } from './apiClient';
import type {
  MagicLinkRequest,
  MagicLinkResponse,
  VerifyMagicLinkResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  Usuario,
  ApiResponse,
} from './types/api.types';

/**
 * Serviço de API para autenticação
 */

export async function requestMagicLink(
  email: string
): Promise<MagicLinkResponse> {
  const payload: MagicLinkRequest = { email };
  const response = await apiClient.post<MagicLinkResponse>(
    '/auth/magic-link',
    payload
  );
  return response.data;
}

export async function verifyMagicLink(
  token: string
): Promise<VerifyMagicLinkResponse> {
  const response = await apiClient.get<VerifyMagicLinkResponse>(
    '/auth/verify-magic-link',
    {
      params: { token },
    }
  );

  if (response.data.success) {
    tokenManager.setTokens(
      response.data.tokens.accessToken,
      response.data.tokens.refreshToken
    );
  }

  return response.data;
}

export async function refreshToken(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  const payload: RefreshTokenRequest = { refreshToken };
  const response = await apiClient.post<RefreshTokenResponse>(
    '/auth/refresh',
    payload
  );

  if (response.data.success) {
    tokenManager.setTokens(
      response.data.accessToken,
      response.data.refreshToken
    );
  }

  return response.data;
}

export async function logout(): Promise<ApiResponse> {
  try {
    const response = await apiClient.post<ApiResponse>('/auth/logout');
    return response.data;
  } finally {
    tokenManager.clearTokens();
  }
}

export async function getMe(): Promise<Usuario> {
  const response = await apiClient.get<{ success: boolean; user: any }>('/auth/me');
  const userData = response.data.user;
  
  // Backend retorna 'tipo', convertemos para 'perfil' para compatibilidade
  return {
    ...userData,
    perfil: userData.tipo || userData.perfil,
  };
}

export async function authHealthCheck(): Promise<ApiResponse> {
  const response = await apiClient.get<ApiResponse>('/auth/health');
  return response.data;
}

export function isAuthenticated(): boolean {
  return tokenManager.isAuthenticated();
}

