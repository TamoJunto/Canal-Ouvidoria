import { apiClient } from './apiClient';
import type {
  Usuario,
  CreateUsuarioRequest,
  UpdateUsuarioRequest,
  ListarUsuariosResponse,
  ApiResponse,
} from './types/api.types';

/**
 * Serviço de API para gestão de usuários
 * Todas as rotas requerem autenticação e perfil ADMIN_MASTER
 */

export async function listarUsuarios(): Promise<Usuario[]> {
  const response = await apiClient.get<ListarUsuariosResponse>(
    `/usuarios?_t=${Date.now()}`
  );
  return response.data.data;
}

export async function getUsuarioById(id: number): Promise<Usuario> {
  const response = await apiClient.get<ApiResponse<Usuario>>(
    `/usuarios/${id}`
  );
  return response.data.data!;
}

export async function createUsuario(
  dados: CreateUsuarioRequest
): Promise<Usuario> {
  const response = await apiClient.post<ApiResponse<Usuario>>(
    '/usuarios',
    dados
  );
  return response.data.data!;
}

export async function updateUsuario(
  id: number,
  dados: UpdateUsuarioRequest
): Promise<Usuario> {
  const response = await apiClient.put<ApiResponse<Usuario>>(
    `/usuarios/${id}`,
    dados
  );
  return response.data.data!;
}

export async function desativarUsuario(id: number): Promise<ApiResponse> {
  const response = await apiClient.delete<ApiResponse>(
    `/usuarios/${id}`
  );
  return response.data;
}

export async function reativarUsuario(id: number): Promise<ApiResponse> {
  const response = await apiClient.post<ApiResponse>(
    `/usuarios/${id}/reativar`
  );
  return response.data;
}

