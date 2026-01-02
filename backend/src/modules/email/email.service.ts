import nodemailer from 'nodemailer';
import { getEmailTransporter, emailDefaults, getEtherealPreviewUrl } from './email.config';
import {
  magicLinkTemplate,
  relatoCriadoTemplate,
  relatoRespondidoTemplate,
  alertaRelatoUrgenteTemplate,
  relatoTransferidoTemplate,
} from './email.templates';
import { logger } from '@utils/logger';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string | null;
  error?: string;
}

export class EmailService {
  /**
   * Envia um email genérico
   */
  async send(options: SendEmailOptions): Promise<EmailResult> {
    try {
      const transporter = await getEmailTransporter();

      const mailOptions = {
        from: `"${emailDefaults.from.name}" <${emailDefaults.from.address}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo || emailDefaults.replyTo,
      };

      const info = await transporter.sendMail(mailOptions);

      // Em desenvolvimento, mostra URL de preview
      const previewUrl = getEtherealPreviewUrl(info.messageId);
      
      if (previewUrl) {
        console.log('\n' + '='.repeat(80));
        console.log('📧 EMAIL ENVIADO (DESENVOLVIMENTO)');
        console.log('='.repeat(80));
        console.log(`📬 Para: ${mailOptions.to}`);
        console.log(`📝 Assunto: ${mailOptions.subject}`);
        console.log(`🔗 Ver email: ${previewUrl}`);
        console.log('='.repeat(80) + '\n');
      }

      logger.info({
        to: mailOptions.to,
        subject: mailOptions.subject,
        messageId: info.messageId,
        previewUrl,
      }, 'Email enviado com sucesso');

      return {
        success: true,
        messageId: info.messageId,
        previewUrl,
      };
    } catch (error) {
      logger.error({ error, to: options.to, subject: options.subject }, 'Erro ao enviar email');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Envia Magic Link para login
   */
  async sendMagicLink(data: {
    email: string;
    nome: string;
    token: string;
    ip: string;
  }): Promise<EmailResult> {
    const frontendUrl = emailDefaults.frontendUrl;
    const magicLink = `${frontendUrl}/auth/verify?token=${data.token}`;

    const template = magicLinkTemplate({
      nome: data.nome,
      magicLink,
      expiresIn: '15 minutos',
      ip: data.ip,
    });

    return this.send({
      to: data.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Envia confirmação de relato criado
   */
  async sendRelatoCriado(data: {
    email: string;
    protocolo: string;
    tipo: string;
    identificado: boolean;
    nome?: string;
  }): Promise<EmailResult> {
    const frontendUrl = emailDefaults.frontendUrl;
    const consultaUrl = `${frontendUrl}/consulta?protocolo=${data.protocolo}`;

    const template = relatoCriadoTemplate({
      protocolo: data.protocolo,
      tipo: data.tipo,
      identificado: data.identificado,
      nome: data.nome,
      consultaUrl,
    });

    return this.send({
      to: data.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Envia notificação de relato respondido
   */
  async sendRelatoRespondido(data: {
    email: string;
    protocolo: string;
    nome?: string;
    resposta: string;
  }): Promise<EmailResult> {
    const frontendUrl = emailDefaults.frontendUrl;
    const consultaUrl = `${frontendUrl}/consulta?protocolo=${data.protocolo}`;

    const template = relatoRespondidoTemplate({
      protocolo: data.protocolo,
      nome: data.nome,
      resposta: data.resposta,
      consultaUrl,
    });

    return this.send({
      to: data.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Envia alerta de relato urgente para a equipe
   */
  async sendAlertaUrgente(data: {
    emails: string[];
    protocolo: string;
    tipo: string;
    prioridade: string;
    comite: string;
    descricao: string;
  }): Promise<EmailResult> {
    const frontendUrl = emailDefaults.frontendUrl;
    const linkAdmin = `${frontendUrl}/admin/relatos`;
    
    // Limita a prévia da descrição
    const descricaoPreview = data.descricao.length > 200 
      ? data.descricao.substring(0, 200) 
      : data.descricao;

    const template = alertaRelatoUrgenteTemplate({
      protocolo: data.protocolo,
      tipo: data.tipo,
      prioridade: data.prioridade,
      comite: data.comite,
      descricaoPreview,
      linkAdmin,
    });

    return this.send({
      to: data.emails,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Envia notificação de relato transferido
   */
  async sendRelatoTransferido(data: {
    emails: string[];
    protocolo: string;
    tipo: string;
    prioridade: string;
    comiteOrigem: string;
    comiteDestino: string;
    motivo: string;
  }): Promise<EmailResult> {
    const frontendUrl = emailDefaults.frontendUrl;
    const linkAdmin = `${frontendUrl}/admin/relatos`;

    const template = relatoTransferidoTemplate({
      protocolo: data.protocolo,
      tipo: data.tipo,
      prioridade: data.prioridade,
      comiteOrigem: data.comiteOrigem,
      comiteDestino: data.comiteDestino,
      motivo: data.motivo,
      linkAdmin,
    });

    return this.send({
      to: data.emails,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }
}

// Exporta instância singleton
export const emailService = new EmailService();