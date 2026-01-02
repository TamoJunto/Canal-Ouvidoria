import { apiClient } from './apiClient';
import type {
  RelatoDetalhado,
  ListarRelatosParams,
  ListarRelatosResponse,
  AddComentarioRequest,
  TransferirRelatoRequest,
  ResponderRelatoRequest,
  ReabrirRelatoRequest,
  ApiResponse,
} from './types/api.types';

/**
 * Serviço de API para relatos autenticados (requer autenticação)
 */

export async function listarRelatos(
  params?: ListarRelatosParams
): Promise<{ relatos: RelatoDetalhado[]; paginacao: any }> {
  const response = await apiClient.get<ListarRelatosResponse>(
    '/relatos',
    { params }
  );
  
  return {
    relatos: response.data.data || [],
    paginacao: response.data.pagination || {},
  };
}

export async function getRelatoDetalhes(id: string): Promise<RelatoDetalhado> {
  const response = await apiClient.get<any>(
    `/relatos/${id}`
  );
  
  console.log('Resposta do backend:', response.data)
  
  // Backend retorna { success, relato, eventos, comentarios }
  if (response.data.relato) {
    return {
      ...response.data.relato,
      comentarios: response.data.comentarios || [],
      mensagens: response.data.mensagens || [],
      historico: response.data.eventos || [],
    } as RelatoDetalhado
  }
  
  return response.data.data || response.data
}

export async function iniciarRelato(id: string): Promise<ApiResponse> {
  const response = await apiClient.post<ApiResponse>(
    `/relatos/${id}/iniciar`
  );
  return response.data;
}

export async function addComentario(
  id: string,
  conteudo: string
): Promise<ApiResponse> {
  const payload: AddComentarioRequest = { conteudo };
  const response = await apiClient.post<ApiResponse>(
    `/relatos/${id}/comentarios`,
    payload
  );
  return response.data;
}

export async function transferirRelato(
  id: string,
  comiteId: string,
  motivo: string
): Promise<ApiResponse> {
  const payload: TransferirRelatoRequest = {
    comiteId,
    motivo,
  };
  const response = await apiClient.post<ApiResponse>(
    `/relatos/${id}/transferir`,
    payload
  );
  return response.data;
}

export async function responderRelato(
  id: string,
  resposta: string
): Promise<ApiResponse> {
  const payload: ResponderRelatoRequest = { resposta };
  const response = await apiClient.post<ApiResponse>(
    `/relatos/${id}/responder`,
    payload
  );
  return response.data;
}

export async function finalizarRelato(id: string): Promise<ApiResponse> {
  const response = await apiClient.post<ApiResponse>(
    `/relatos/${id}/finalizar`
  );
  return response.data;
}

export async function reabrirRelato(
  id: string,
  motivo: string
): Promise<ApiResponse> {
  const payload: ReabrirRelatoRequest = { motivo };
  const response = await apiClient.post<ApiResponse>(
    `/relatos/${id}/reabrir`,
    payload
  );
  return response.data;
}

