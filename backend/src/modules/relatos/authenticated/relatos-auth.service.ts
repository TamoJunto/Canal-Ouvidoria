import { RelatosAuthRepository, RelatosFilters } from './relatos-auth.repository';
import { AppError } from '@middlewares/error-handler';
import { logger } from '@utils/logger';
import { emailService } from '@modules/email/email.service';

export class RelatosAuthService {
  private repository: RelatosAuthRepository;

  constructor() {
    this.repository = new RelatosAuthRepository();
  }

  async listarRelatos(filters: RelatosFilters, usuarioId: string) {
    try {
        console.log('=== SERVICE LISTAR RELATOS ===');
        console.log('Filters:', filters);
        console.log('Usuario ID:', usuarioId);

      logger.info({ filters, usuarioId }, 'Listando relatos');
      
      const result = await this.repository.findAll(filters);
      
        console.log('Result from repository:', result);
        console.log('Total de relatos:', result.data.length);

      return {
        success: true,
        data: result.data.map(r => ({
          id: r.id,
          protocolo: r.protocolo,
          tipo: r.tipo_relato,
          descricao: r.descricao.substring(0, 100) + '...', // Preview
          status: r.status,
          prioridade: r.prioridade,
          identificado: r.identificado,
          denunciante_nome: r.denunciante_nome,
          comite: r.comite_nome,
          criado_em: r.criado_em,
          atualizado_em: r.atualizado_em
        })),
        pagination: result.pagination
      };
    } catch (error) {
      logger.error({ error, filters }, 'Erro ao listar relatos');
      throw new AppError('Erro ao listar relatos', 500);
    }
  }

  async getDetalhes(relatoId: string, usuarioId: string) {
    const relato = await this.repository.findById(relatoId);
    
    if (!relato) {
      throw new AppError('Relato não encontrado', 404);
    }

    // Buscar eventos, comentários e mensagens públicas
    const [eventos, comentarios, mensagens] = await Promise.all([
      this.repository.getEventos(relatoId),
      this.repository.getComentariosInternos(relatoId),
      this.repository.getMensagensPublicas(relatoId)
    ]);

    logger.info({ relatoId, usuarioId }, 'Detalhes do relato acessados');

    return {
      success: true,
      relato: {
        id: relato.id,
        protocolo: relato.protocolo,
        tipo: relato.tipo_relato,
        descricao: relato.descricao,
        pessoas_envolvidas: relato.pessoas_envolvidas,
        quem_sabe: relato.quem_sabe,
        possui_evidencias: relato.possui_evidencias,
        status: relato.status,
        prioridade: relato.prioridade,
        
        // Dados do denunciante (sensíveis)
        identificado: relato.identificado,
        denunciante_nome: relato.denunciante_nome,
        denunciante_email: relato.denunciante_email,
        denunciante_telefone: relato.denunciante_telefone,
        
        // Comitê e responsável
        comite_id: relato.comite_id,
        comite_nome: relato.comite_nome,
        responsavel_id: relato.responsavel_id,
        responsavel_nome: relato.responsavel_nome,
        
        // Resposta
        resposta_final: relato.resposta_final,
        respondido_em: relato.respondido_em,
        
        // Datas
        criado_em: relato.criado_em,
        atualizado_em: relato.atualizado_em
      },
      eventos: eventos.map(e => ({
        id: e.id,
        tipo: e.tipo,
        descricao: e.descricao,
        usuario: e.usuario_nome,
        criado_em: e.criado_em
      })),
      comentarios: comentarios.map(c => ({
        id: c.id,
        conteudo: c.conteudo,
        usuario: c.usuario_nome,
        criado_em: c.criado_em
      })),
      mensagens: mensagens.map(m => ({
        id: m.id,
        texto: m.texto,
        remetente_tipo: m.remetente_tipo,
        criado_em: m.criado_em
      }))
    };
  }

  async iniciarTratamento(relatoId: string, usuarioId: string) {
    const relato = await this.repository.findById(relatoId);
    
    if (!relato) {
      throw new AppError('Relato não encontrado', 404);
    }

    if (relato.status !== 'NOVO') {
      throw new AppError('Relato já está em tratamento', 400);
    }

    const updated = await this.repository.updateStatus(relatoId, 'EM_ANDAMENTO', usuarioId);

    logger.info({ relatoId, usuarioId }, 'Tratamento iniciado');

    return {
      success: true,
      message: 'Tratamento iniciado com sucesso',
      relato: {
        id: updated.id,
        protocolo: updated.protocolo,
        status: updated.status
      }
    };
  }

  async addComentario(relatoId: string, conteudo: string, usuarioId: string) {
    const relato = await this.repository.findById(relatoId);
    
    if (!relato) {
      throw new AppError('Relato não encontrado', 404);
    }

    const comentario = await this.repository.addComentarioInterno(relatoId, conteudo, usuarioId);

    logger.info({ relatoId, usuarioId }, 'Comentário interno adicionado');

    return {
      success: true,
      message: 'Comentário adicionado com sucesso',
      comentario: {
        id: comentario.id,
        conteudo: comentario.conteudo,
        criado_em: comentario.criado_em
      }
    };
  }

  async transferir(relatoId: string, comiteId: string, motivo: string, usuarioId: string) {
    const relato = await this.repository.findById(relatoId);
    
    if (!relato) {
      throw new AppError('Relato não encontrado', 404);
    }

    const updated = await this.repository.transferirComite(relatoId, comiteId, motivo, usuarioId);

    logger.info({ relatoId, comiteId, usuarioId }, 'Relato transferido');

    return {
      success: true,
      message: 'Relato transferido com sucesso',
      relato: {
        id: updated.id,
        protocolo: updated.protocolo,
        comite_id: updated.comite_id
      }
    };
  }

  async responder(relatoId: string, resposta: string, usuarioId: string) {
    const relato = await this.repository.findById(relatoId);
    
    if (!relato) {
      throw new AppError('Relato não encontrado', 404);
    }

    if (relato.status === 'RESPONDIDO' || relato.status === 'FINALIZADO') {
      throw new AppError('Relato já foi respondido', 400);
    }

    const updated = await this.repository.responder(relatoId, resposta, usuarioId);

    logger.info({ relatoId, usuarioId }, 'Relato respondido');

    // TODO: Enviar email ao denunciante
    const emailDenunciante = relato.denunciante_email || relato.email_notificacao;
        if (emailDenunciante) {
            try {
            await emailService.sendRelatoRespondido({
                email: emailDenunciante,
                protocolo: relato.protocolo,
                nome: relato.denunciante_nome,
                resposta: resposta,
            });
            logger.info({ relatoId, email: emailDenunciante }, 'Email de resposta enviado ao denunciante');
            } catch (emailError) {
            // Não falha a resposta se o email falhar
            logger.error({ emailError, relatoId }, 'Falha ao enviar email de resposta');
            }
        }


    return {
      success: true,
      message: 'Resposta enviada com sucesso',
      relato: {
        id: updated.id,
        protocolo: updated.protocolo,
        status: updated.status,
        respondido_em: updated.respondido_em
      }
    };
  }

  async finalizar(relatoId: string, usuarioId: string) {
    const relato = await this.repository.findById(relatoId);
    
    if (!relato) {
      throw new AppError('Relato não encontrado', 404);
    }

    if (relato.status === 'FINALIZADO') {
      throw new AppError('Relato já está finalizado', 400);
    }

    const updated = await this.repository.updateStatus(relatoId, 'FINALIZADO', usuarioId);

    logger.info({ relatoId, usuarioId }, 'Relato finalizado');

    return {
      success: true,
      message: 'Relato finalizado com sucesso',
      relato: {
        id: updated.id,
        protocolo: updated.protocolo,
        status: updated.status
      }
    };
  }

  async reabrir(relatoId: string, motivo: string, usuarioId: string) {
    const relato = await this.repository.findById(relatoId);
    
    if (!relato) {
      throw new AppError('Relato não encontrado', 404);
    }

    if (relato.status !== 'FINALIZADO' && relato.status !== 'EM_ANDAMENTO') {
      throw new AppError('Apenas relatos finalizados ou respondidos podem ser reabertos', 400);
    }

    const updated = await this.repository.updateStatus(relatoId, 'EM_ANDAMENTO', usuarioId);
    
    // Adicionar motivo como comentário
    await this.repository.addComentarioInterno(relatoId, `Relato reaberto. Motivo: ${motivo}`, usuarioId);

    logger.info({ relatoId, usuarioId, motivo }, 'Relato reaberto');

    return {
      success: true,
      message: 'Relato reaberto com sucesso',
      relato: {
        id: updated.id,
        protocolo: updated.protocolo,
        status: updated.status
      }
    };
  }
}