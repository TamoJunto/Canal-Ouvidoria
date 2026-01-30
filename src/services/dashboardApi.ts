import { apiClient } from './apiClient';
import type {
  DashboardData,
  DashboardKPIs,
  ApiResponse,
} from './types/api.types';
import type { DashboardResumo, DashboardFilters } from '@/types/dashboard';

/**
 * Serviço de API para dashboard
 */

export async function getDashboard(filters?: DashboardFilters): Promise<DashboardData> {
  const params: any = {};
  
  if (filters?.dataInicio) {
    params.dataInicio = filters.dataInicio;
  }
  if (filters?.dataFim) {
    params.dataFim = filters.dataFim;
  }
  if (filters?.comiteId) {
    params.comiteId = filters.comiteId;
  }
  if (filters?.tipoOcorrencia) {
    params.tipoOcorrencia = filters.tipoOcorrencia;
  }
  
  const response = await apiClient.get<ApiResponse<DashboardData>>(
    '/dashboard',
    { params }
  );
  return response.data.data!;
}

export async function getKPIs(): Promise<DashboardKPIs> {
  const response = await apiClient.get<ApiResponse<DashboardKPIs>>(
    '/dashboard/kpis'
  );
  return response.data.data!;
}

export async function getPorStatus(): Promise<DashboardData['por_status']> {
  const response = await apiClient.get<ApiResponse<DashboardData['por_status']>>(
    '/dashboard/por-status'
  );
  return response.data.data!;
}

export async function getPorTipo(): Promise<DashboardData['por_tipo']> {
  const response = await apiClient.get<ApiResponse<DashboardData['por_tipo']>>(
    '/dashboard/por-tipo'
  );
  return response.data.data!;
}

export async function getPorPrioridade(): Promise<DashboardData['por_prioridade']> {
  const response = await apiClient.get<ApiResponse<DashboardData['por_prioridade']>>(
    '/dashboard/por-prioridade'
  );
  return response.data.data!;
}

export async function getPorComite(): Promise<DashboardData['por_comite']> {
  const response = await apiClient.get<ApiResponse<DashboardData['por_comite']>>(
    '/dashboard/por-comite'
  );
  return response.data.data!;
}

export async function getPorPeriodo(): Promise<DashboardData['por_periodo']> {
  const response = await apiClient.get<ApiResponse<DashboardData['por_periodo']>>(
    '/dashboard/por-periodo'
  );
  return response.data.data!;
}

export async function getTempoMedio(): Promise<number> {
  const response = await apiClient.get<ApiResponse<{ tempo_medio: number }>>(
    '/dashboard/tempo-medio'
  );
  return response.data.data!.tempo_medio;
}

export async function exportarDashboard(): Promise<{
  success: boolean;
  tipo_exportacao: string;
  total_registros: number;
  data: any[];
}> {
  const response = await apiClient.get('/dashboard/exportar');
  return response.data;
}

// Funções de compatibilidade com código legado
export async function getDashboardResumo(
  filters?: DashboardFilters
): Promise<DashboardResumo> {
  try {
    // Mapear tipoOcorrencia do frontend para o formato do backend
    const backendFilters: DashboardFilters = { ...filters };
    
    if (filters?.tipoOcorrencia && filters.tipoOcorrencia !== "Todos") {
      // Mapear valores do frontend para valores do backend
      const tipoMap: Record<string, string> = {
        "ASSÉDIO MORAL": "ASSEDIO_MORAL",
        "ASSÉDIO SEXUAL": "ASSEDIO_SEXUAL",
        "AMEAÇA / AGRESSÃO": "AMEAÇA_AGRESSÃO",
        "CONFLITO DE INTERESSES": "CONFLITO_INTERESSES",
        "DISCRIMINAÇÃO": "PRECONCEITO_DISCRIMINACAO",
        "FRAUDE": "CORRUPCAO",
        "SAUDE E SEGURANÇA": "SAUDE_SEGURANCA",
        "VAZAMENTO DE DADOS": "VAZAMENTO_DADOS",
        "COMPORTAMENTO INADEQUADO": "COMPORTAMENTO_INADEQUADO",
        "OUTROS": "OUTROS",
      };
      
      backendFilters.tipoOcorrencia = tipoMap[filters.tipoOcorrencia] || filters.tipoOcorrencia;
    } else {
      delete backendFilters.tipoOcorrencia;
    }
    
    const [data, tempoMedioData] = await Promise.all([
      getDashboard(backendFilters),
      getTempoMedio().catch(() => null)
      ]);
    
    return {
      kpis: {
        total: data.kpis.total_relatos,
        novos: data.kpis.novos,
        emAndamento: data.kpis.em_andamento,
        finalizados: data.kpis.finalizados,
        tempoMedioAtendimento: tempoMedioData ? {
          dias: tempoMedioData,
          totalFinalizados: data.kpis.finalizados,
        } : undefined,
        variacaoTotal: { percentual: 0, periodo: 'mensal' },
        variacaoNovos: { percentual: 0, periodo: 'mensal' },
        variacaoEmAndamento: { percentual: 0, periodo: 'mensal' },
        variacaoFinalizados: { percentual: 0, periodo: 'mensal' },
      },
      serieTemporal: data.por_periodo.map((item) => ({
        name: item.mes,
        novos: item.quantidade,
        finalizados: 0,
      })),
      periodo: {
        inicio: filters?.dataInicio || '',
        fim: filters?.dataFim || '',
      },
    };
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    return {
      kpis: {
        total: 0,
        novos: 0,
        emAndamento: 0,
        finalizados: 0,
        variacaoTotal: { percentual: 0, periodo: 'mensal' },
        variacaoNovos: { percentual: 0, periodo: 'mensal' },
        variacaoEmAndamento: { percentual: 0, periodo: 'mensal' },
        variacaoFinalizados: { percentual: 0, periodo: 'mensal' },
      },
      serieTemporal: [],
      periodo: {
        inicio: '',
        fim: '',
      },
    };
  }
}

export async function exportDashboardReport(
  _filters?: DashboardFilters
): Promise<any> {
  const data = await exportarDashboard();
  
  // Converte para CSV
  if (!data.data || data.data.length === 0) {
    return new Blob(['Nenhum dado para exportar'], { type: 'text/csv' });
  }
  
  const headers = Object.keys(data.data[0]);
  const csvRows = [];
  
  csvRows.push(headers.join(','));
  
  for (const row of data.data) {
    const values = headers.map(header => {
      const val = row[header];
      return `"${val !== null && val !== undefined ? val : ''}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csv = csvRows.join('\n');
  return new Blob([csv], { type: 'text/csv' });
}
