import { pool } from '../../../config/database';
import { CreateReportDTO, Report } from '../types/relato.types';

export class RelatosPublicRepository {
  
  async create(data: CreateReportDTO & { protocol: string }): Promise<Report> {
    const isIdentified = !data.is_anonymous;
    
    // Campos conforme tabela REAL do banco
    const query = `
      INSERT INTO relatos (
        protocolo, 
        descricao, 
        tipo_relato, 
        pessoas_envolvidas, 
        quem_sabe,
        possui_evidencias,
        identificado,
        denunciante_nome,
        denunciante_email,
        denunciante_telefone,
        email_notificacao,
        status,
        prioridade
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'NOVO', 'MEDIA')
      RETURNING *
    `;
    
    const values = [
      data.protocol,                          // $1 protocolo
      data.description,                       // $2 descricao
      data.type,                              // $3 tipo_relato
      data.involved_people || null,           // $4 pessoas_envolvidas
      null,                                   // $5 quem_sabe
      data.has_evidence || false,             // $6 possui_evidencias (com S!)
      isIdentified,                           // $7 identificado (boolean)
      isIdentified ? data.name : null,        // $8 denunciante_nome
      isIdentified ? data.contact_email : null, // $9 denunciante_email
      data.contact_phone || null,             // $10 denunciante_telefone
      !isIdentified ? data.contact_email : null, // $11 email_notificacao (para anônimos)
    ];

    try {
      const { rows } = await pool.query(query, values);
      return this.mapToEntity(rows[0]);
    } catch (error: any) {
      console.error('ERRO no INSERT:', {
        message: error.message,
        code: error.code,
        detail: error.detail
      });
      throw error;
    }
  }

  async findByProtocol(protocol: string): Promise<Report | null> {
    const query = `
      SELECT * 
      FROM relatos 
      WHERE protocolo = $1 AND deletado_em IS NULL
    `;
    
    const { rows } = await pool.query(query, [protocol]);
    if (!rows[0]) return null;
    
    return this.mapToEntity(rows[0]);
  }

  async addMessage(reportId: string, content: string) {
    const query = `
      INSERT INTO mensagens_publicas (relato_id, remetente_tipo, texto, criado_em)
      VALUES ($1, 'DENUNCIANTE', $2, NOW())
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [reportId, content]);
    return rows[0];
  }

  async getPublicTimeline(reportId: string) {
    const query = `
      SELECT 
        id,
        'MENSAGEM_PUBLICA' as tipo,
        texto,
        remetente_tipo,
        criado_em
      FROM mensagens_publicas
      WHERE relato_id = $1
      ORDER BY criado_em ASC
    `;
    
    const { rows } = await pool.query(query, [reportId]);
    return rows;
  }

  private mapToEntity(row: any): Report {
    return {
      id: row.id,
      protocol: row.protocolo,
      description: row.descricao,
      type: row.tipo_relato,
      involved_people: row.pessoas_envolvidas,
      has_evidence: row.possui_evidencias,
      is_identified: row.identificado,
      reporter_name: row.denunciante_nome,
      reporter_email: row.denunciante_email,
      reporter_phone: row.denunciante_telefone,
      notification_email: row.email_notificacao,
      status: row.status,
      priority: row.prioridade,
      resposta_final: row.resposta_final,
      respondido_em: row.respondido_em,
      created_at: row.criado_em,
      updated_at: row.atualizado_em,
    };
  }
  async addAttachment(reportId: string, fileData: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
  }) {
    const query = `
      INSERT INTO anexos (
        relato_id,
        nome_original,
        nome_arquivo,
        mime_type,
        tamanho,
        caminho,
        hash_sha256
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      reportId,              // $1 relato_id
      fileData.originalName, // $2 nome_original
      fileData.filename,     // $3 nome_arquivo
      fileData.mimetype,     // $4 mime_type
      fileData.size,         // $5 tamanho
      fileData.path,         // $6 caminho
      
      'pending',             // $7 status
    ];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async getAttachments(reportId: string) {
    const query = `
      SELECT 
        id,
        nome_original,
        nome_arquivo,
        mime_type,
        tamanho,
        caminho,
        criado_em
      FROM anexos
      WHERE relato_id = $1 AND deletado_em IS NULL
      ORDER BY criado_em ASC
    `;
    
    const { rows } = await pool.query(query, [reportId]);
    return rows;
  }

  async getTotalAttachmentSize(reportId: string): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(tamanho), 0) as total
      FROM anexos
      WHERE relato_id = $1 AND deletado_em IS NULL
    `;
    
    const { rows } = await pool.query(query, [reportId]);
    return parseInt(rows[0].total);
  }

  async getAttachmentById(attachmentId: string, reportId: string) {
  const query = `
    SELECT 
      id,
      relato_id,
      nome_original,
      nome_arquivo,
      mime_type,
      tamanho,
      caminho,
      criado_em
    FROM anexos
    WHERE id = $1 AND relato_id = $2 AND deletado_em IS NULL
  `;
  
  const { rows } = await pool.query(query, [attachmentId, reportId]);
  return rows[0] || null;
  }
}

