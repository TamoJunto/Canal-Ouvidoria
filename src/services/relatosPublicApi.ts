import { apiClient } from './apiClient';
import type {
  CreateRelatoRequest,
  CreateRelatoResponse,
  RelatoPublico,
  CreateMensagemRequest,
  ApiResponse,
  Anexo,
} from './types/api.types';

/**
 * Serviço de API para relatos públicos (sem autenticação)
 */

export async function createRelato(
  dados: CreateRelatoRequest
): Promise<CreateRelatoResponse> {
  const response = await apiClient.post<CreateRelatoResponse>(
    '/public/relatos',
    dados
  );
  return response.data;
}

export async function getRelatoByProtocol(
  protocolo: string
): Promise<RelatoPublico> {
  const response = await apiClient.get<RelatoPublico>(
    `/public/relatos/${protocolo}`
  );
  return response.data;
}

export async function createMensagem(
  protocolo: string,
  content: string
): Promise<ApiResponse> {
  const payload: CreateMensagemRequest = { content };
  const response = await apiClient.post<ApiResponse>(
    `/public/relatos/${protocolo}/mensagens`,
    payload
  );
  return response.data;
}

export async function uploadAnexos(
  protocolo: string,
  files: File[]
): Promise<ApiResponse<Anexo[]>> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await apiClient.post<ApiResponse<Anexo[]>>(
    `/public/relatos/${protocolo}/anexos`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

export async function getAnexos(protocolo: string): Promise<Anexo[]> {
  const response = await apiClient.get<{ 
    success: boolean; 
    protocol: string; 
    attachments: Array<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploaded_at: string;
    }>
  }>(
    `/public/relatos/${protocolo}/anexos`
  );
  
  console.log('Resposta de anexos:', response.data)
  
  // Converte para o formato esperado
  return (response.data.attachments || []).map(att => ({
    id: att.id,
    nome_original: att.name,
    tipo_mime: att.type,
    tamanho: att.size,
    criado_em: att.uploaded_at,
  }));
}

export async function downloadAnexo(
  protocolo: string,
  anexoId: number
): Promise<Blob> {
  const response = await apiClient.get(
    `/public/relatos/${protocolo}/anexos/${anexoId}`,
    {
      responseType: 'blob',
    }
  );
  return response.data;
}

export function getAnexoDownloadUrl(
  protocolo: string,
  anexoId: number
): string {
  const baseURL = apiClient.defaults.baseURL;
  return `${baseURL}/public/relatos/${protocolo}/anexos/${anexoId}`;
}

