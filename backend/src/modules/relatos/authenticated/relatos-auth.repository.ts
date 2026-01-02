import { pool } from '@config/database';

export interface RelatosFilters {
  status?: string[];
  tipo?: string[];
  prioridade?: string[];
  comiteId?: string;
  dataInicio?: Date;
  dataFim?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export class RelatosAuthRepository {
  
  async findAll(filters: RelatosFilters) {
    
    console.log('===Findall repository ===');
    console.log('Filters: ', filters);
    
    try {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const offset = (page - 1) * limit;
        
        let whereConditions: string[] = ['r.deletado_em IS NULL'];
        let params: any[] = [];
        let paramIndex = 1;
    
    // Filtro por status
    if (filters.status && filters.status.length > 0) {
      whereConditions.push(`status = ANY($${paramIndex})`);
      params.push(filters.status);
      paramIndex++;
    }
    
    // Filtro por tipo
    if (filters.tipo && filters.tipo.length > 0) {
      whereConditions.push(`tipo_relato = ANY($${paramIndex})`);
      params.push(filters.tipo);
      paramIndex++;
    }
    
    // Filtro por prioridade
    if (filters.prioridade && filters.prioridade.length > 0) {
      whereConditions.push(`prioridade = ANY($${paramIndex})`);
      params.push(filters.prioridade);
      paramIndex++;
    }
    
    // Filtro por comitê
    if (filters.comiteId) {
      whereConditions.push(`comite_id = $${paramIndex}`);
      params.push(filters.comiteId);
      paramIndex++;
    }
    
    // Filtro por data
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
    
    // Busca textual
    if (filters.search) {
      whereConditions.push(`(
        descricao ILIKE $${paramIndex} OR 
        protocolo ILIKE $${paramIndex} OR
        denunciante_nome ILIKE $${paramIndex}
      )`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM relatos r 
      WHERE ${whereClause}
    `;
    
    // Query para buscar relatos
    const query = `
      SELECT 
        r.*,
        c.nome as comite_nome
      FROM relatos r
      LEFT JOIN comites c ON c.id = r.comite_id
      WHERE ${whereClause}
      ORDER BY r.criado_em DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);
    
    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, params.slice(0, -2)),
      pool.query(query, params)
    ]);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  } catch (error) {
    console.log('Error: ', error);
    throw error;
    }
}

  async findById(id: string) {
    const query = `
      SELECT 
        r.*,
        c.nome as comite_nome,
        u.nome as responsavel_nome
      FROM relatos r
      LEFT JOIN comites c ON c.id = r.comite_id
      LEFT JOIN usuarios u ON u.id = r.responsavel_id
      WHERE r.id = $1 AND r.deletado_em IS NULL
    `;
    
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
  
  async getEventos(relatoId: string) {
    const query = `
      SELECT 
        e.*,
        u.nome as usuario_nome
      FROM relato_eventos e
      LEFT JOIN usuarios u ON u.id = e.usuario_id
      WHERE e.relato_id = $1
      ORDER BY e.criado_em DESC
    `;
    
    const { rows } = await pool.query(query, [relatoId]);
    return rows;
  }
  
  async addEvento(relatoId: string, tipo: string, payload: any, usuarioId: string) {
    const query = `
      INSERT INTO relato_eventos (
        relato_id,
        tipo,
        descricao,
        usuario_id,
        criado_em
      )
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [
      relatoId,
      tipo,
      payload.descricao || payload.conteudo || JSON.stringify(payload),
      usuarioId
    ]);
    
    return rows[0];
  }
  
  async updateStatus(relatoId: string, status: string, usuarioId: string) {
    const query = `
      UPDATE relatos
      SET status = $1, atualizado_em = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [status, relatoId]);
    let tipoEvento = 'INICIADO'
    if (status === 'FINALIZADO') tipoEvento = 'FINALIZADO'
    if (status === 'REABERTO') tipoEvento = 'REABERTO'
    // Registrar evento
    await this.addEvento(relatoId, tipoEvento, {
      descricao: `Status alterado para ${status}`
    }, usuarioId);
    
    return rows[0];
  }
  
  async transferirComite(relatoId: string, comiteId: string, motivo: string, usuarioId: string) {
    const query = `
      UPDATE relatos
      SET comite_id = $1, atualizado_em = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [comiteId, relatoId]);
    
    // Registrar evento
    await this.addEvento(relatoId, 'TRANSFERIDO', {
      descricao: `Transferido para outro comitê. Motivo: ${motivo}`
    }, usuarioId);
    
    return rows[0];
  }
  
  async addComentarioInterno(relatoId: string, conteudo: string, usuarioId: string) {
    const query = `
      INSERT INTO comentarios_internos (
        relato_id,
        usuario_id,
        conteudo,
        criado_em
      )
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [relatoId, usuarioId, conteudo]);
    
    // Registrar evento
    await this.addEvento(relatoId, 'COMENTARIO_ADICIONADO', {
      descricao: 'Comentário interno adicionado'
    }, usuarioId);
    
    return rows[0];
  }

  async getMensagensPublicas(relatoId: string) {
    const query = `
      SELECT 
        id,
        texto,
        remetente_tipo,
        criado_em
      FROM mensagens_publicas
      WHERE relato_id = $1
      ORDER BY criado_em ASC
    `;
    
    const { rows } = await pool.query(query, [relatoId]);
    return rows;
  }
  
  async getComentariosInternos(relatoId: string) {
    const query = `
      SELECT 
        c.*,
        u.nome as usuario_nome
      FROM comentarios_internos c
      LEFT JOIN usuarios u ON u.id = c.usuario_id
      WHERE c.relato_id = $1
      ORDER BY c.criado_em DESC
    `;
    
    const { rows } = await pool.query(query, [relatoId]);
    return rows;
  }
  
  async responder(relatoId: string, resposta: string, usuarioId: string) {
    const query = `
      UPDATE relatos
      SET 
        resposta_final = $1,
        respondido_em = NOW(),
        respondido_por = $2,
        status = 'FINALIZADO',
        atualizado_em = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [resposta, usuarioId, relatoId]);
    
    // Registrar evento
    await this.addEvento(relatoId, 'RESPOSTA_ENVIADA', {
      descricao: 'Relato respondido'
    }, usuarioId);
    
    return rows[0];
  }
}