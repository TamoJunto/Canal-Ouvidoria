import { pool } from '@config/database';
import { sha256 } from '@utils/crypto';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: 'ADMIN_MASTER' | 'OPERADOR';
  ativo: boolean;
  comite_id: string | null;
  criado_em: Date;
  atualizado_em: Date;
}

export interface MagicLinkToken {
  id: string;
  email: string;
  token_hash: string;
  usado: boolean;
  usado_em: Date | null;
  ip_origem: string;
  user_agent: string | null;
  expira_em: Date;
  criado_em: Date;
}

export interface RefreshToken {
  id: string;
  usuario_id: string;
  token_hash: string;
  ip: string;
  user_agent: string | null;
  device_fingerprint: string | null;
  revogado: boolean;
  revogado_em: Date | null;
  expira_em: Date;
  criado_em: Date;
}

export class AuthRepository {
  /**
   * Busca usuário por email
   */
  async findUserByEmail(email: string): Promise<Usuario | null> {
    const result = await pool.query<Usuario>(
      `SELECT id, nome, email, tipo, ativo, comite_id, criado_em, atualizado_em
       FROM usuarios
       WHERE email = $1 AND deletado_em IS NULL`,
      [email.toLowerCase()]
    );

    return result.rows[0] || null;
  }

  /**
   * Busca usuário por ID
   */
  async findUserById(userId: string): Promise<Usuario | null> {
    const result = await pool.query<Usuario>(
      `SELECT id, nome, email, tipo, ativo, comite_id, criado_em, atualizado_em
       FROM usuarios
       WHERE id = $1 AND deletado_em IS NULL`,
      [userId]
    );

    return result.rows[0] || null;
  }

  /**
   * Cria um token de magic link
   */
  async createMagicLinkToken(data: {
    email: string;
    token: string;
    ip: string;
    userAgent: string | null;
    expiresIn: number; // em segundos
  }): Promise<MagicLinkToken> {
    const tokenHash = sha256(data.token);
    const expiresAt = new Date(Date.now() + data.expiresIn * 1000);

    const result = await pool.query<MagicLinkToken>(
      `INSERT INTO magic_link_tokens (email, token_hash, ip_origem, user_agent, expira_em)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.email, tokenHash, data.ip, data.userAgent, expiresAt]
    );

    return result.rows[0];
  }

  /**
   * Busca e valida token de magic link
   */
  async findAndValidateMagicLinkToken(token: string): Promise<MagicLinkToken | null> {
    const tokenHash = sha256(token);

    const result = await pool.query<MagicLinkToken>(
      `SELECT *
       FROM magic_link_tokens
       WHERE token_hash = $1
         AND NOT usado
         AND expira_em > NOW()
       ORDER BY criado_em DESC
       LIMIT 1`,
      [tokenHash]
    );

    return result.rows[0] || null;
  }

  /**
   * Marca um magic link token como usado
   */
  async markMagicLinkTokenAsUsed(tokenId: string): Promise<void> {
    await pool.query(
      `UPDATE magic_link_tokens
       SET usado = true, usado_em = NOW()
       WHERE id = $1`,
      [tokenId]
    );
  }

  /**
   * Limpa tokens de magic link expirados
   */
  async cleanExpiredMagicLinkTokens(): Promise<number> {
    const result = await pool.query(
      `DELETE FROM magic_link_tokens
       WHERE expira_em < NOW() - INTERVAL '7 days'`
    );

    return result.rowCount || 0;
  }

  /**
   * Cria um refresh token
   */
  async createRefreshToken(data: {
    userId: string;
    token: string;
    ip: string;
    userAgent: string | null;
    deviceFingerprint: string | null;
    expiresIn: number; // em segundos
  }): Promise<RefreshToken> {
    const tokenHash = sha256(data.token);
    const expiresAt = new Date(Date.now() + data.expiresIn * 1000);

    const result = await pool.query<RefreshToken>(
      `INSERT INTO refresh_tokens (usuario_id, token_hash, ip, user_agent, device_fingerprint, expira_em)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.userId, tokenHash, data.ip, data.userAgent, data.deviceFingerprint, expiresAt]
    );

    return result.rows[0];
  }

  /**
   * Busca e valida refresh token
   */
  async findAndValidateRefreshToken(token: string): Promise<RefreshToken | null> {
    const tokenHash = sha256(token);

    const result = await pool.query<RefreshToken>(
      `SELECT *
       FROM refresh_tokens
       WHERE token_hash = $1
         AND NOT revogado
         AND expira_em > NOW()
       LIMIT 1`,
      [tokenHash]
    );

    return result.rows[0] || null;
  }

  /**
   * Revoga um refresh token
   */
  async revokeRefreshToken(tokenId: string): Promise<void> {
    await pool.query(
      `UPDATE refresh_tokens
       SET revogado = true, revogado_em = NOW()
       WHERE id = $1`,
      [tokenId]
    );
  }

  /**
   * Revoga todos os refresh tokens de um usuário
   */
  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await pool.query(
      `UPDATE refresh_tokens
       SET revogado = true, revogado_em = NOW()
       WHERE usuario_id = $1 AND NOT revogado`,
      [userId]
    );
  }

  /**
   * Limpa refresh tokens expirados e revogados
   */
  async cleanExpiredRefreshTokens(): Promise<number> {
    const result = await pool.query(
      `DELETE FROM refresh_tokens
       WHERE (revogado AND revogado_em < NOW() - INTERVAL '30 days')
          OR (expira_em < NOW() - INTERVAL '30 days')`
    );

    return result.rowCount || 0;
  }

  /**
   * Conta quantos refresh tokens ativos um usuário tem
   */
  async countActiveRefreshTokens(userId: string): Promise<number> {
    const result = await pool.query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM refresh_tokens
       WHERE usuario_id = $1
         AND NOT revogado
         AND expira_em > NOW()`,
      [userId]
    );

    return parseInt(result.rows[0].count);
  }
}



