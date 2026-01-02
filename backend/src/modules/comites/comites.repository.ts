import { pool } from '@config/database';

export interface CreateComiteDTO {
  nome: string;
  descricao?: string;
}

export interface UpdateComiteDTO {
  nome?: string;
  descricao?: string;
}

export interface ComitesFilters {
  ativo?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export class ComitesRepository {

  async findAll(filters: ComitesFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = ['c.deletado_em IS NULL'];
    let params: any[] = [];
    let paramIndex = 1;

    // Filtro por ativo
    if (filters.ativo !== undefined) {
      whereConditions.push(`c.ativo = $${paramIndex}`);
      params.push(filters.ativo);
      paramIndex++;
    }

    // Busca textual
    if (filters.search) {
      whereConditions.push(`(c.nome ILIKE $${paramIndex} OR c.descricao ILIKE $${paramIndex})`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM comites c
      WHERE ${whereClause}
    `;

    // Query para buscar comitês com contagem de membros
    const query = `
      SELECT 
        c.id,
        c.nome,
        c.descricao,
        c.ativo,
        c.criado_em,
        c.atualizado_em,
        COUNT(u.id) as total_membros
      FROM comites c
      LEFT JOIN usuarios u ON u.comite_id = c.id AND u.deletado_em IS NULL AND u.ativo = true
      WHERE ${whereClause}
      GROUP BY c.id
      ORDER BY c.nome ASC
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
  }

  async findById(id: string) {
    const query = `
      SELECT 
        c.id,
        c.nome,
        c.descricao,
        c.ativo,
        c.criado_em,
        c.atualizado_em
      FROM comites c
      WHERE c.id = $1 AND c.deletado_em IS NULL
    `;

    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async findByNome(nome: string) {
    const query = `
      SELECT id, nome
      FROM comites
      WHERE LOWER(nome) = LOWER($1) AND deletado_em IS NULL
    `;

    const { rows } = await pool.query(query, [nome]);
    return rows[0] || null;
  }

  async getMembros(comiteId: string) {
    const query = `
      SELECT 
        u.id,
        u.nome,
        u.email,
        u.tipo,
        u.ativo,
        u.criado_em
      FROM usuarios u
      WHERE u.comite_id = $1 AND u.deletado_em IS NULL
      ORDER BY u.nome ASC
    `;

    const { rows } = await pool.query(query, [comiteId]);
    return rows;
  }

  async create(data: CreateComiteDTO) {
    const query = `
      INSERT INTO comites (
        id,
        nome,
        descricao,
        ativo,
        criado_em,
        atualizado_em
      )
      VALUES (
        gen_random_uuid(),
        $1,
        $2,
        true,
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      data.nome,
      data.descricao || null
    ]);

    return rows[0];
  }

  async update(id: string, data: UpdateComiteDTO) {
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.nome !== undefined) {
      fields.push(`nome = $${paramIndex}`);
      params.push(data.nome);
      paramIndex++;
    }

    if (data.descricao !== undefined) {
      fields.push(`descricao = $${paramIndex}`);
      params.push(data.descricao);
      paramIndex++;
    }

    fields.push(`atualizado_em = NOW()`);

    const query = `
      UPDATE comites
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND deletado_em IS NULL
      RETURNING *
    `;

    params.push(id);

    const { rows } = await pool.query(query, params);
    return rows[0] || null;
  }

  async deactivate(id: string) {
    const query = `
      UPDATE comites
      SET ativo = false, atualizado_em = NOW()
      WHERE id = $1 AND deletado_em IS NULL
      RETURNING *
    `;

    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async activate(id: string) {
    const query = `
      UPDATE comites
      SET ativo = true, atualizado_em = NOW()
      WHERE id = $1 AND deletado_em IS NULL
      RETURNING *
    `;

    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async delete(id: string) {
    const query = `
      UPDATE comites
      SET deletado_em = NOW(), atualizado_em = NOW()
      WHERE id = $1 AND deletado_em IS NULL
      RETURNING *
    `;

    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async addMembro(comiteId: string, usuarioId: string) {
    const query = `
      UPDATE usuarios
      SET comite_id = $1, atualizado_em = NOW()
      WHERE id = $2 AND deletado_em IS NULL
      RETURNING *
    `;

    const { rows } = await pool.query(query, [comiteId, usuarioId]);
    return rows[0] || null;
  }

  async removeMembro(usuarioId: string) {
    const query = `
      UPDATE usuarios
      SET comite_id = NULL, atualizado_em = NOW()
      WHERE id = $1 AND deletado_em IS NULL
      RETURNING *
    `;

    const { rows } = await pool.query(query, [usuarioId]);
    return rows[0] || null;
  }

  async countRelatos(comiteId: string) {
    const query = `
      SELECT COUNT(*) as total
      FROM relatos
      WHERE comite_id = $1 AND deletado_em IS NULL
    `;

    const { rows } = await pool.query(query, [comiteId]);
    return parseInt(rows[0].total);
  }
}