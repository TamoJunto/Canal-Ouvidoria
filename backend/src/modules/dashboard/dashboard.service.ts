import { DashboardRepository, DashboardFilters } from './dashboard.repository';
import { AppError } from '@middlewares/error-handler';
import { logger } from '@utils/logger';

export class DashboardService {
  private repository: DashboardRepository;

  constructor() {
    this.repository = new DashboardRepository();
  }

  async getKPIs(filters: DashboardFilters) {
    try {
      const kpis = await this.repository.getKPIs(filters);

      return {
        success: true,
        data: {
          total: parseInt(kpis.total) || 0,
          novos: parseInt(kpis.novos) || 0,
          em_andamento: parseInt(kpis.em_andamento) || 0,
          finalizados: parseInt(kpis.finalizados) || 0,
          identificados: parseInt(kpis.identificados) || 0,
          anonimos: parseInt(kpis.anonimos) || 0,
          urgentes: parseInt(kpis.urgentes) || 0,
          alta_prioridade: parseInt(kpis.alta_prioridade) || 0
        }
      };
    } catch (error) {
      logger.error({ error, filters }, 'Erro ao buscar KPIs');
      throw new AppError('Erro ao buscar KPIs', 500);
    }
  }

  async getPorStatus(filters: DashboardFilters) {
    try {
      const dados = await this.repository.getPorStatus(filters);

      return {
        success: true,
        data: dados.map(d => ({
          status: d.status,
          quantidade: parseInt(d.quantidade)
        }))
      };
    } catch (error) {
      logger.error({ error, filters }, 'Erro ao buscar relatos por status');
      throw new AppError('Erro ao buscar dados', 500);
    }
  }

  async getPorTipo(filters: DashboardFilters) {
    try {
      const dados = await this.repository.getPorTipo(filters);

      // Mapear nomes mais amigáveis
      const tipoLabels: Record<string, string> = {
        'ASSEDIO_MORAL': 'Assédio Moral',
        'ASSEDIO_SEXUAL': 'Assédio Sexual',
        'DISCRIMINACAO': 'Discriminação',
        'CORRUPCAO': 'Corrupção',
        'FRAUDE': 'Fraude',
        'COMPORTAMENTO_INADEQUADO': 'Comportamento Inadequado',
        'CONFLITO_INTERESSES': 'Conflito de Interesses',
        'OUTROS': 'Outros'
      };

      return {
        success: true,
        data: dados.map(d => ({
          tipo: d.tipo_relato,
          tipo_label: tipoLabels[d.tipo_relato] || d.tipo_relato,
          quantidade: parseInt(d.quantidade)
        }))
      };
    } catch (error) {
      logger.error({ error, filters }, 'Erro ao buscar relatos por tipo');
      throw new AppError('Erro ao buscar dados', 500);
    }
  }

  async getPorPrioridade(filters: DashboardFilters) {
    try {
      const dados = await this.repository.getPorPrioridade(filters);

      return {
        success: true,
        data: dados.map(d => ({
          prioridade: d.prioridade,
          quantidade: parseInt(d.quantidade)
        }))
      };
    } catch (error) {
      logger.error({ error, filters }, 'Erro ao buscar relatos por prioridade');
      throw new AppError('Erro ao buscar dados', 500);
    }
  }

  async getPorComite(filters: DashboardFilters) {
    try {
      const dados = await this.repository.getPorComite(filters);

      return {
        success: true,
        data: dados.map(d => ({
          comite_id: d.comite_id,
          comite_nome: d.comite_nome,
          quantidade: parseInt(d.quantidade),
          novos: parseInt(d.novos),
          em_andamento: parseInt(d.em_andamento),
          finalizados: parseInt(d.finalizados)
        }))
      };
    } catch (error) {
      logger.error({ error, filters }, 'Erro ao buscar relatos por comitê');
      throw new AppError('Erro ao buscar dados', 500);
    }
  }

  async getPorPeriodo(filters: DashboardFilters) {
    try {
      const dados = await this.repository.getPorPeriodo(filters);

      return {
        success: true,
        data: dados.map(d => ({
          periodo: d.periodo,
          periodo_label: d.periodo_label,
          quantidade: parseInt(d.quantidade)
        }))
      };
    } catch (error) {
      logger.error({ error, filters }, 'Erro ao buscar relatos por período');
      throw new AppError('Erro ao buscar dados', 500);
    }
  }

  async getTempoMedio(filters: DashboardFilters) {
    try {
      const dados = await this.repository.getTempoMedioResolucao(filters);

      return {
        success: true,
        data: {
          media_dias: dados.media_dias ? parseFloat(dados.media_dias).toFixed(1) : null,
          min_dias: dados.min_dias ? parseFloat(dados.min_dias).toFixed(1) : null,
          max_dias: dados.max_dias ? parseFloat(dados.max_dias).toFixed(1) : null,
          total_finalizados: parseInt(dados.total_finalizados) || 0
        }
      };
    } catch (error) {
      logger.error({ error, filters }, 'Erro ao buscar tempo médio');
      throw new AppError('Erro ao buscar dados', 500);
    }
  }

  async exportar(filters: DashboardFilters, tipoUsuario: string) {
    try {
      let dados;

      // OPERADOR só vê dados resumidos, ADMIN_MASTER vê tudo
      if (tipoUsuario === 'ADMIN_MASTER') {
        dados = await this.repository.exportarCompleto(filters);
      } else {
        dados = await this.repository.exportarResumido(filters);
      }

      logger.info({ filters, tipoUsuario, total: dados.length }, 'Relatório exportado');

      return {
        success: true,
        tipo_exportacao: tipoUsuario === 'ADMIN_MASTER' ? 'COMPLETO' : 'RESUMIDO',
        total_registros: dados.length,
        data: dados
      };
    } catch (error) {
      logger.error({ error, filters, tipoUsuario }, 'Erro ao exportar relatório');
      throw new AppError('Erro ao exportar relatório', 500);
    }
  }

  // Dashboard completo (todos os dados de uma vez)
  async getDashboardCompleto(filters: DashboardFilters) {
    try {
      const [kpis, porStatus, porTipo, porPrioridade, porComite, porPeriodo, tempoMedio] = await Promise.all([
        this.repository.getKPIs(filters),
        this.repository.getPorStatus(filters),
        this.repository.getPorTipo(filters),
        this.repository.getPorPrioridade(filters),
        this.repository.getPorComite(filters),
        this.repository.getPorPeriodo(filters),
        this.repository.getTempoMedioResolucao(filters)
      ]);

      return {
        success: true,
        data: {
          kpis: {
            total: parseInt(kpis.total) || 0,
            novos: parseInt(kpis.novos) || 0,
            em_andamento: parseInt(kpis.em_andamento) || 0,
            finalizados: parseInt(kpis.finalizados) || 0,
            identificados: parseInt(kpis.identificados) || 0,
            anonimos: parseInt(kpis.anonimos) || 0,
            urgentes: parseInt(kpis.urgentes) || 0,
            alta_prioridade: parseInt(kpis.alta_prioridade) || 0
          },
          por_status: porStatus.map(d => ({
            status: d.status,
            quantidade: parseInt(d.quantidade)
          })),
          por_tipo: porTipo.map(d => ({
            tipo: d.tipo_relato,
            quantidade: parseInt(d.quantidade)
          })),
          por_prioridade: porPrioridade.map(d => ({
            prioridade: d.prioridade,
            quantidade: parseInt(d.quantidade)
          })),
          por_comite: porComite.map(d => ({
            comite_id: d.comite_id,
            comite_nome: d.comite_nome,
            quantidade: parseInt(d.quantidade)
          })),
          por_periodo: porPeriodo.map(d => ({
            periodo: d.periodo,
            periodo_label: d.periodo_label,
            quantidade: parseInt(d.quantidade)
          })),
          tempo_medio: {
            media_dias: tempoMedio.media_dias ? parseFloat(tempoMedio.media_dias).toFixed(1) : null,
            total_finalizados: parseInt(tempoMedio.total_finalizados) || 0
          }
        }
      };
    } catch (error) {
      logger.error({ error, filters }, 'Erro ao buscar dashboard completo');
      throw new AppError('Erro ao buscar dashboard', 500);
    }
  }
}