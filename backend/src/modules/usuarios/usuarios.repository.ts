import { pool } from '@config/database';

export interface CreateUsuarioDTO {
  nome: string;
  email: string;
  tipo: 'ADMIN_MASTER' | 'OPERADOR';
  comiteId?: string;
}

export interface UpdateUsuarioDTO {
  nome?: string;
  email?: string;
  tipo?: 'ADMIN_MASTER' | 'OPERADOR';
  comiteId?: string | null;
}

export interface UsuariosFilters {
  tipo?: string;
  ativo?: boolean;
  comiteId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class UsuariosRepository {

  async findAll(filters: UsuariosFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = ['u.deletado_em IS NULL'];
    let params: any[] = [];
    let paramIndex = 1;

    // Filtro por tipo
    if (filters.tipo) {
      whereConditions.push(`u.tipo = $${paramIndex}`);
      params.push(filters.tipo);
      paramIndex++;
    }

    // Filtro por ativo
    if (filters.ativo !== undefined) {
      whereConditions.push(`u.ativo = $${paramIndex}`);
      params.push(filters.ativo);
      paramIndex++;
    }

    // Filtro por comitê
    if (filters.comiteId) {
      whereConditions.push(`u.comite_id = $${paramIndex}`);
      params.push(filters.comiteId);
      paramIndex++;
    }

    // Busca textual
    if (filters.search) {
      whereConditions.push(`(u.nome ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM usuarios u
      WHERE ${whereClause}
    `;

    // Query para buscar usuários
    const query = `
      SELECT 
        u.id,
        u.nome,
        u.email,
        u.tipo,
        u.ativo,
        u.comite_id,
        c.nome as comite_nome,
        u.criado_em,
        u.atualizado_em
      FROM usuarios u
      LEFT JOIN comites c ON c.id = u.comite_id
      WHERE ${whereClause}
      ORDER BY u.nome ASC
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
        u.id,
        u.nome,
        u.email,
        u.tipo,
        u.ativo,
        u.comite_id,
        c.nome as comite_nome,
        u.criado_em,
        u.atualizado_em
      FROM usuarios u
      LEFT JOIN comites c ON c.id = u.comite_id
      WHERE u.id = $1 AND u.deletado_em IS NULL
    `;

    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async findByEmail(email: string) {
    const query = `
      SELECT id, nome, email, tipo, ativo, comite_id
      FROM usuarios
      WHERE email = $1 AND deletado_em IS NULL
    `;

    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  }

  async create(data: CreateUsuarioDTO) {
    const query = `
      INSERT INTO usuarios (
        id,
        nome,
        email,
        tipo,
        comite_id,
        ativo,
        criado_em,
        atualizado_em
      )
      VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        true,
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      data.nome,
      data.email,
      data.tipo,
      data.comiteId || null
    ]);

    return rows[0];
  }

  async update(id: string, data: UpdateUsuarioDTO) {
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.nome !== undefined) {
      fields.push(`nome = $${paramIndex}`);
      params.push(data.nome);
      paramIndex++;
    }

    if (data.email !== undefined) {
      fields.push(`email = $${paramIndex}`);
      params.push(data.email);
      paramIndex++;
    }

    if (data.tipo !== undefined) {
      fields.push(`tipo = $${paramIndex}`);
      params.push(data.tipo);
      paramIndex++;
    }

    if (data.comiteId !== undefined) {
      fields.push(`comite_id = $${paramIndex}`);
      params.push(data.comiteId);
      paramIndex++;
    }

    fields.push(`atualizado_em = NOW()`);

    const query = `
      UPDATE usuarios
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
      UPDATE usuarios
      SET ativo = false, atualizado_em = NOW()
      WHERE id = $1 AND deletado_em IS NULL
      RETURNING *
    `;

    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async activate(id: string) {
    const query = `
      UPDATE usuarios
      SET ativo = true, atualizado_em = NOW()
      WHERE id = $1 AND deletado_em IS NULL
      RETURNING *
    `;

    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async delete(id: string) {
    const query = `
      UPDATE usuarios
      SET deletado_em = NOW(), atualizado_em = NOW()
      WHERE id = $1 AND deletado_em IS NULL
      RETURNING *
    `;

    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}