import { apiClient } from './apiClient';
import type {
  Comite,
  CreateComiteRequest,
  UpdateComiteRequest,
  AddMembroRequest,
  ListarComitesResponse,
  ApiResponse,
} from './types/api.types';

/**
 * Serviço de API para gestão de comitês
 */

export async function listarComites(): Promise<Comite[]> {
  const response = await apiClient.get<ListarComitesResponse>(
    '/comites'
  );
  return response.data.data;
}

export async function getComiteById(id: string): Promise<Comite> {
  const response = await apiClient.get<{ success: boolean; comite: Comite }>(
    `/comites/${id}`
  );
  console.log('Resposta de getComiteById:', response.data)
  return response.data.comite;
}

export async function createComite(
  dados: CreateComiteRequest
): Promise<Comite> {
  const response = await apiClient.post<ApiResponse<Comite>>(
    '/comites',
    dados
  );
  return response.data.data!;
}

export async function updateComite(
  id: number,
  dados: UpdateComiteRequest
): Promise<Comite> {
  const response = await apiClient.put<ApiResponse<Comite>>(
    `/comites/${id}`,
    dados
  );
  return response.data.data!;
}

export async function desativarComite(id: number): Promise<ApiResponse> {
  const response = await apiClient.delete<ApiResponse>(
    `/comites/${id}`
  );
  return response.data;
}

export async function reativarComite(id: number): Promise<ApiResponse> {
  const response = await apiClient.post<ApiResponse>(
    `/comites/${id}/reativar`
  );
  return response.data;
}

export async function addMembro(
  comiteId: string,
  usuarioId: string
): Promise<ApiResponse> {
  const payload: AddMembroRequest = { usuarioId };
  const response = await apiClient.post<ApiResponse>(
    `/comites/${comiteId}/membros`,
    payload
  );
  return response.data;
}

export async function removeMembro(
  comiteId: string,
  usuarioId: string
): Promise<ApiResponse> {
  const response = await apiClient.delete<ApiResponse>(
    `/comites/${comiteId}/membros/${usuarioId}`
  );
  return response.data;
}

