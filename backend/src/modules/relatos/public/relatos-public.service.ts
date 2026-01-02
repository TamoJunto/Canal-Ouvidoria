import { RelatosPublicRepository } from './relatos-public.repository';
import { generateProtocol } from '@utils/protocol-generator';
import { AppError } from '@middlewares/error-handler';
import { CreateReportDTO } from '../types/relato.types';
import { logger } from '@utils/logger';
import { emailService } from '@modules/email/email.service';

export class RelatosPublicService {
  private repository: RelatosPublicRepository;

  constructor() {
    this.repository = new RelatosPublicRepository();
  }

  async createReport(data: CreateReportDTO) {
    try {
      const protocol = generateProtocol();
      
      logger.info({ protocol, type: data.type }, 'Criando novo relato');
      
      const report = await this.repository.create({
        ...data,
        protocol,
      });
      const emailNotificacao = data.contact_email;
        if (emailNotificacao) {
          try {
            await emailService.sendRelatoCriado({
              email: emailNotificacao,
              protocolo: report.protocol,
              tipo: data.type,
              identificado: data.is_anonymous,
              nome: data.name,
            });
            logger.info({ protocol, email: emailNotificacao }, 'Email de confirmação enviado');
          } catch (emailError) {
            // Não falha a criação do relato se o email falhar
            logger.error({ emailError, protocol }, 'Falha ao enviar email de confirmação');
          }
      }


      return {
        success: true,
        protocol: report.protocol,
        message: 'Relato registrado com sucesso! Guarde seu protocolo para acompanhamento.',
        status: report.status,
        created_at: report.created_at,
      };
    } catch (error) {
      logger.error({ error, data }, 'Erro ao criar relato');
      throw new AppError('Erro ao registrar relato. Tente novamente.', 500, 'CREATE_REPORT_ERROR');
    }
  }

  async getReportStatus(protocol: string) {
    try {
      logger.info({ protocol }, 'Buscando status do relato');
      
      const report = await this.repository.findByProtocol(protocol);
      
      if (!report) {
        throw new AppError('Protocolo não encontrado', 404, 'PROTOCOL_NOT_FOUND');
      }
      
      logger.info({ reportId: report.id, protocol }, 'Relato encontrado, buscando timeline');
      
      let timeline = [];
      try {
        timeline = await this.repository.getPublicTimeline(report.id);
        logger.info({ reportId: report.id, timelineCount: timeline.length }, 'Timeline recuperada');
      } catch (timelineError) {
        logger.error({ error: timelineError, reportId: report.id }, 'Erro ao buscar timeline, retornando vazio');
        // Continua sem timeline se der erro
      }
      
    return {
      success: true,
      protocol: report.protocol,
      status: report.status,
      description: report.description,
      type: report.type,
      created_at: report.created_at,
      updated_at: report.updated_at,
      resposta_final: report.resposta_final,
      respondido_em: report.respondido_em,
      timeline: timeline.map((event) => ({
        type: event.tipo,
        content: {
          mensagem: event.texto,
          remetente: event.remetente_tipo,
        },
        timestamp: event.criado_em,
      })),
    };
    } catch (error) {
      logger.error({ error, protocol }, 'Erro em getReportStatus');
      throw error;
    }
  }

  async addPublicMessage(protocol: string, content: string) {
    const report = await this.repository.findByProtocol(protocol);
    
    if (!report) {
      throw new AppError('Protocolo não encontrado', 404, 'PROTOCOL_NOT_FOUND');
    }

    logger.info({ protocol, reportId: report.id }, 'Adicionando mensagem pública');
    
    const message = await this.repository.addMessage(report.id, content);
    
    return {
      success: true,
      message: 'Mensagem registrada com sucesso',
      timestamp: message.criado_em,
    };
  }

  async uploadAttachments(protocol: string, files: Express.Multer.File[]) {
    const report = await this.repository.findByProtocol(protocol);
    
    if (!report) {
      throw new AppError('Protocolo não encontrado', 404);
    }

    // Verificar tamanho total atual + novos arquivos
    const currentSize = await this.repository.getTotalAttachmentSize(report.id);
    const newFilesSize = files.reduce((sum, file) => sum + file.size, 0);
    const totalSize = currentSize + newFilesSize;

    if (totalSize > 100 * 1024 * 1024) { // 100MB
      throw new AppError('Limite total de 100MB de anexos excedido para este relato', 400);
    }

    const savedFiles = [];
    
    for (const file of files) {
      try {
        const attachment = await this.repository.addAttachment(report.id, {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
        });
        
        savedFiles.push({
          id: attachment.id,
          name: attachment.nome_original,
          size: attachment.tamanho,
          type: attachment.mime_type,
        });
        
        logger.info({ 
          protocol, 
          reportId: report.id, 
          fileName: file.originalname 
        }, 'Anexo adicionado');
        
      } catch (error) {
        logger.error({ error, fileName: file.originalname }, 'Erro ao salvar anexo');
      }
    }

    return {
      success: true,
      message: `${savedFiles.length} arquivo(s) enviado(s) com sucesso`,
      files: savedFiles,
    };
  }

  async getReportAttachments(protocol: string) {
    const report = await this.repository.findByProtocol(protocol);
    
    if (!report) {
      throw new AppError('Protocolo não encontrado', 404);
    }

    const attachments = await this.repository.getAttachments(report.id);
    
    return {
      success: true,
      protocol: report.protocol,
      attachments: attachments.map(att => ({
        id: att.id,
        name: att.nome_original,
        size: att.tamanho,
        type: att.mime_type,
        uploaded_at: att.criado_em,
      })),
    };
  }

  async downloadAttachment(protocol: string, attachmentId: string) {
    const report = await this.repository.findByProtocol(protocol);
  
    if (!report) {
      throw new AppError('Protocolo não encontrado', 404);
    }

    const attachment = await this.repository.getAttachmentById(attachmentId, report.id);
  
    if (!attachment) {
      throw new AppError('Anexo não encontrado', 404);
    }

    // Verificar se o arquivo existe fisicamente
    const fs = require('fs');
    if (!fs.existsSync(attachment.caminho)) {
      logger.error({ attachmentId, path: attachment.caminho }, 'Arquivo não encontrado no sistema');
      throw new AppError('Arquivo não encontrado no servidor', 404);
    }

    return {
      filePath: attachment.caminho,
      fileName: attachment.nome_original,
      mimeType: attachment.mime_type,
      size: attachment.tamanho,
    };
  }


}