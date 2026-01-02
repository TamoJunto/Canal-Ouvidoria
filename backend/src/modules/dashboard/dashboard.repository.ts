import { pool } from '@config/database';

export interface DashboardFilters {
  dataInicio?: Date;
  dataFim?: Date;
  comiteId?: string;
  tipoOcorrencia?: string;
}

export class DashboardRepository {

  // KPIs Gerais
  async getKPIs(filters: DashboardFilters) {
    let whereConditions: string[] = ['deletado_em IS NULL'];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.dataInicio) {
      whereConditions.push(`criado_em >= $${paramIndex}`);
      params.push(filters.dataInicio);
      paramIndex++;
    }

    if (filters.dataFim) {
      whereConditions.push(`criado_em <= $${paramIndex}`);
      params.push(filters.dataFim);
      paramIndex++;
    }

    if (filters.comiteId) {
      whereConditions.push(`comite_id = $${paramIndex}`);
      params.push(filters.comiteId);
      paramIndex++;
    }

    if (filters.tipoOcorrencia) {
      whereConditions.push(`tipo_relato = $${paramIndex}`);
      params.push(filters.tipoOcorrencia);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'NOVO') as novos,
        COUNT(*) FILTER (WHERE status = 'EM_ANDAMENTO') as em_andamento,
        COUNT(*) FILTER (WHERE status = 'FINALIZADO') as finalizados,
        COUNT(*) FILTER (WHERE identificado = true) as identificados,
        COUNT(*) FILTER (WHERE identificado = false) as anonimos,
        COUNT(*) FILTER (WHERE prioridade = 'URGENTE') as urgentes,
        COUNT(*) FILTER (WHERE prioridade = 'ALTA') as alta_prioridade
      FROM relatos
      WHERE ${whereClause}
    `;

    const { rows } = await pool.query(query, params);
    return rows[0];
  }

  // Relatos por Status
  async getPorStatus(filters: DashboardFilters) {
    let whereConditions: string[] = ['deletado_em IS NULL'];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.dataInicio) {
      whereConditions.push(`criado_em >= $${paramIndex}`);
      params.push(filters.dataInicio);
      paramIndex++;
    }

    if (filters.dataFim) {
      whereConditions.push(`criado_em <= $${paramIndex}`);
      params.push(filters.dataFim);
      paramIndex++;
    }

    if (filters.comiteId) {
      whereConditions.push(`comite_id = $${paramIndex}`);
      params.push(filters.comiteId);
      paramIndex++;
    }

    if (filters.tipoOcorrencia) {
      whereConditions.push(`tipo_relato = $${paramIndex}`);
      params.push(filters.tipoOcorrencia);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        status,
        COUNT(*) as quantidade
      FROM relatos
      WHERE ${whereClause}
      GROUP BY status
      ORDER BY quantidade DESC
    `;

    const { rows } = await pool.query(query, params);
    return rows;
  }

  // Relatos por Tipo
  async getPorTipo(filters: DashboardFilters) {
    let whereConditions: string[] = ['deletado_em IS NULL'];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.dataInicio) {
      whereConditions.push(`criado_em >= $${paramIndex}`);
      params.push(filters.dataInicio);
      paramIndex++;
    }

    if (filters.dataFim) {
      whereConditions.push(`criado_em <= $${paramIndex}`);
      params.push(filters.dataFim);
      paramIndex++;
    }

    if (filters.comiteId) {
      whereConditions.push(`comite_id = $${paramIndex}`);
      params.push(filters.comiteId);
      paramIndex++;
    }

    if (filters.tipoOcorrencia) {
      whereConditions.push(`tipo_relato = $${paramIndex}`);
      params.push(filters.tipoOcorrencia);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        tipo_relato,
        COUNT(*) as quantidade
      FROM relatos
      WHERE ${whereClause}
      GROUP BY tipo_relato
      ORDER BY quantidade DESC
    `;

    const { rows } = await pool.query(query, params);
    return rows;
  }

  // Relatos por Prioridade
  async getPorPrioridade(filters: DashboardFilters) {
    let whereConditions: string[] = ['deletado_em IS NULL'];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.dataInicio) {
      whereConditions.push(`criado_em >= $${paramIndex}`);
      params.push(filters.dataInicio);
      paramIndex++;
    }

    if (filters.dataFim) {
      whereConditions.push(`criado_em <= $${paramIndex}`);
      params.push(filters.dataFim);
      paramIndex++;
    }

    if (filters.comiteId) {
      whereConditions.push(`comite_id = $${paramIndex}`);
      params.push(filters.comiteId);
      paramIndex++;
    }

    if (filters.tipoOcorrencia) {
      whereConditions.push(`tipo_relato = $${paramIndex}`);
      params.push(filters.tipoOcorrencia);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        prioridade,
        COUNT(*) as quantidade
      FROM relatos
      WHERE ${whereClause}
      GROUP BY prioridade
      ORDER BY 
        CASE prioridade 
          WHEN 'URGENTE' THEN 1 
          WHEN 'ALTA' THEN 2 
          WHEN 'MEDIA' THEN 3 
          WHEN 'BAIXA' THEN 4 
        END
    `;

    const { rows } = await pool.query(query, params);
    return rows;
  }

  // Relatos por Comitê
  async getPorComite(filters: DashboardFilters) {
    let whereConditions: string[] = ['r.deletado_em IS NULL'];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.dataInicio) {
      whereConditions.push(`r.criado_em >= $${paramIndex}`);
      params.push(filters.dataInicio);
      paramIndex++;
    }

    if (filters.dataFim) {
      whereConditions.push(`r.criado_em <= $${paramIndex}`);
      params.push(filters.dataFim);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        c.id as comite_id,
        c.nome as comite_nome,
        COUNT(r.id) as quantidade,
        COUNT(r.id) FILTER (WHERE r.status = 'NOVO') as novos,
        COUNT(r.id) FILTER (WHERE r.status = 'EM_ANDAMENTO') as em_andamento,
        COUNT(r.id) FILTER (WHERE r.status = 'FINALIZADO') as finalizados
      FROM comites c
      LEFT JOIN relatos r ON r.comite_id = c.id AND ${whereClause}
      WHERE c.deletado_em IS NULL AND c.ativo = true
      GROUP BY c.id, c.nome
      ORDER BY quantidade DESC
    `;

    const { rows } = await pool.query(query, params);
    return rows;
  }

  // Relatos por Período (últimos 12 meses)
  async getPorPeriodo(filters: DashboardFilters) {
    let whereConditions: string[] = ['deletado_em IS NULL'];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.comiteId) {
      whereConditions.push(`comite_id = $${paramIndex}`);
      params.push(filters.comiteId);
      paramIndex++;
    }

    if (filters.tipoOcorrencia) {
      whereConditions.push(`tipo_relato = $${paramIndex}`);
      params.push(filters.tipoOcorrencia);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', criado_em), 'YYYY-MM') as periodo,
        TO_CHAR(DATE_TRUNC('month', criado_em), 'Mon/YY') as periodo_label,
        COUNT(*) as quantidade
      FROM relatos
      WHERE ${whereClause}
        AND criado_em >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '11 months')
      GROUP BY DATE_TRUNC('month', criado_em)
      ORDER BY periodo ASC
    `;

    const { rows } = await pool.query(query, params);
    return rows;
  }

  // Tempo Médio de Resolução
  async getTempoMedioResolucao(filters: DashboardFilters) {
    let whereConditions: string[] = [
      'deletado_em IS NULL',
      'status = \'FINALIZADO\'',
      'respondido_em IS NOT NULL'
    ];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.dataInicio) {
      whereConditions.push(`criado_em >= $${paramIndex}`);
      params.push(filters.dataInicio);
      paramIndex++;
    }

    if (filters.dataFim) {
      whereConditions.push(`criado_em <= $${paramIndex}`);
      params.push(filters.dataFim);
      paramIndex++;
    }

    if (filters.comiteId) {
      whereConditions.push(`comite_id = $${paramIndex}`);
      params.push(filters.comiteId);
      paramIndex++;
    }

    if (filters.tipoOcorrencia) {
      whereConditions.push(`tipo_relato = $${paramIndex}`);
      params.push(filters.tipoOcorrencia);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        AVG(EXTRACT(EPOCH FROM (respondido_em - criado_em)) / 86400) as media_dias,
        MIN(EXTRACT(EPOCH FROM (respondido_em - criado_em)) / 86400) as min_dias,
        MAX(EXTRACT(EPOCH FROM (respondido_em - criado_em)) / 86400) as max_dias,
        COUNT(*) as total_finalizados
      FROM relatos
      WHERE ${whereClause}
    `;

    const { rows } = await pool.query(query, params);
    return rows[0];
  }

  // Exportar Relatório - Dados Resumidos (OPERADOR)
  async exportarResumido(filters: DashboardFilters) {
    let whereConditions: string[] = ['r.deletado_em IS NULL'];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.dataInicio) {
      whereConditions.push(`r.criado_em >= $${paramIndex}`);
      params.push(filters.dataInicio);
      paramIndex++;
    }

    if (filters.dataFim) {
      whereConditions.push(`r.criado_em <= $${paramIndex}`);
      params.push(filters.dataFim);
      paramIndex++;
    }

    if (filters.comiteId) {
      whereConditions.push(`r.comite_id = $${paramIndex}`);
      params.push(filters.comiteId);
      paramIndex++;
    }

    if (filters.tipoOcorrencia) {
      whereConditions.push(`r.tipo_relato = $${paramIndex}`);
      params.push(filters.tipoOcorrencia);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // SEM dados do denunciante
    const query = `
      SELECT 
        r.protocolo,
        r.tipo_relato,
        r.status,
        r.prioridade,
        r.identificado,
        c.nome as comite,
        r.criado_em,
        r.respondido_em
      FROM relatos r
      LEFT JOIN comites c ON c.id = r.comite_id
      WHERE ${whereClause}
      ORDER BY r.criado_em DESC
    `;

    const { rows } = await pool.query(query, params);
    return rows;
  }

  // Exportar Relatório - Dados Completos (ADMIN_MASTER)
  async exportarCompleto(filters: DashboardFilters) {
    let whereConditions: string[] = ['r.deletado_em IS NULL'];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.dataInicio) {
      whereConditions.push(`r.criado_em >= $${paramIndex}`);
      params.push(filters.dataInicio);
      paramIndex++;
    }

    if (filters.dataFim) {
      whereConditions.push(`r.criado_em <= $${paramIndex}`);
      params.push(filters.dataFim);
      paramIndex++;
    }

    if (filters.comiteId) {
      whereConditions.push(`r.comite_id = $${paramIndex}`);
      params.push(filters.comiteId);
      paramIndex++;
    }

    if (filters.tipoOcorrencia) {
      whereConditions.push(`r.tipo_relato = $${paramIndex}`);
      params.push(filters.tipoOcorrencia);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // COM dados do denunciante (só para ADMIN_MASTER)
    const query = `
      SELECT 
        r.protocolo,
        r.tipo_relato,
        r.descricao,
        r.pessoas_envolvidas,
        r.status,
        r.prioridade,
        r.identificado,
        r.denunciante_nome,
        r.denunciante_email,
        r.denunciante_telefone,
        r.denunciante_relacao,
        c.nome as comite,
        u.nome as responsavel,
        r.resposta_final,
        r.criado_em,
        r.respondido_em,
        r.ip_origem
      FROM relatos r
      LEFT JOIN comites c ON c.id = r.comite_id
      LEFT JOIN usuarios u ON u.id = r.responsavel_id
      WHERE ${whereClause}
      ORDER BY r.criado_em DESC
    `;

    const { rows } = await pool.query(query, params);
    return rows;
  }
}