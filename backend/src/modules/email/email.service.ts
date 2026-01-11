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
   * Envia um email (Usa API do Resend em Produção e Ethereal em Desenvolvimento)
   */
  async send(options: SendEmailOptions): Promise<EmailResult> {
    try {
      const toAddress = Array.isArray(options.to) ? options.to.join(', ') : options.to;
      const fromAddress = `"${emailDefaults.from.name}" <${emailDefaults.from.address}>`;

      // --- 🚀 MODO PRODUÇÃO: API RESEND (HTTP/443) ---
      if (process.env.NODE_ENV === 'production') {
        logger.info(`Tentando enviar email via API Resend para: ${toAddress}`);

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SMTP_PASS}`
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
            reply_to: options.replyTo || emailDefaults.replyTo,
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          logger.error({ error: errorText }, 'Erro na API do Resend');
          throw new Error(`Falha API Resend: ${errorText}`);
        }

        // --- CORREÇÃO AQUI: Dizendo ao TS que o retorno tem um ID ---
        const data = await response.json() as { id: string };
        
        logger.info({ id: data.id }, '✅ Email enviado via API Resend (HTTP 443)');

        return {
          success: true,
          messageId: data.id,
          previewUrl: null
        };
      }

      // --- 🧪 MODO DESENVOLVIMENTO: NODEMAILER (SMTP/Ethereal) ---
      const transporter = await getEmailTransporter();

      const mailOptions = {
        from: fromAddress,
        to: toAddress,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo || emailDefaults.replyTo,
      };

      const info = await transporter.sendMail(mailOptions);
      const previewUrl = getEtherealPreviewUrl(info.messageId);
      
      if (previewUrl) {
        console.log('\n' + '='.repeat(80));
        console.log('📧 EMAIL ENVIADO (DESENVOLVIMENTO)');
        console.log('='.repeat(80));
        console.log(`📬 Para: ${mailOptions.to}`);
        console.log(`🔗 Ver email: ${previewUrl}`);
        console.log('='.repeat(80) + '\n');
      }

      logger.info({ messageId: info.messageId }, 'Email enviado via SMTP (Dev)');

      return {
        success: true,
        messageId: info.messageId,
        previewUrl,
      };

    } catch (error) {
      logger.error({ error, to: options.to }, 'Erro crítico ao enviar email');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // --- MÉTODOS DE NEGÓCIO ---

  async sendMagicLink(data: { email: string; nome: string; token: string; ip: string; }) {
    const magicLink = `${emailDefaults.frontendUrl}/auth/verify?token=${data.token}`;
    const template = magicLinkTemplate({ nome: data.nome, magicLink, expiresIn: '15 minutos', ip: data.ip });
    return this.send({ to: data.email, subject: template.subject, html: template.html, text: template.text });
  }

  async sendRelatoCriado(data: { email: string; protocolo: string; tipo: string; identificado: boolean; nome?: string; }) {
    const consultaUrl = `${emailDefaults.frontendUrl}/consulta?protocolo=${data.protocolo}`;
    const template = relatoCriadoTemplate({ protocolo: data.protocolo, tipo: data.tipo, identificado: data.identificado, nome: data.nome, consultaUrl });
    return this.send({ to: data.email, subject: template.subject, html: template.html, text: template.text });
  }

  async sendRelatoRespondido(data: { email: string; protocolo: string; nome?: string; resposta: string; }) {
    const consultaUrl = `${emailDefaults.frontendUrl}/consulta?protocolo=${data.protocolo}`;
    const template = relatoRespondidoTemplate({ protocolo: data.protocolo, nome: data.nome, resposta: data.resposta, consultaUrl });
    return this.send({ to: data.email, subject: template.subject, html: template.html, text: template.text });
  }

  async sendAlertaUrgente(data: { emails: string[]; protocolo: string; tipo: string; prioridade: string; comite: string; descricao: string; }) {
    const linkAdmin = `${emailDefaults.frontendUrl}/admin/relatos`;
    const descricaoPreview = data.descricao.length > 200 ? data.descricao.substring(0, 200) : data.descricao;
    const template = alertaRelatoUrgenteTemplate({ protocolo: data.protocolo, tipo: data.tipo, prioridade: data.prioridade, comite: data.comite, descricaoPreview, linkAdmin });
    return this.send({ to: data.emails, subject: template.subject, html: template.html, text: template.text });
  }

  async sendRelatoTransferido(data: { emails: string[]; protocolo: string; tipo: string; prioridade: string; comiteOrigem: string; comiteDestino: string; motivo: string; }) {
    const linkAdmin = `${emailDefaults.frontendUrl}/admin/relatos`;
    const template = relatoTransferidoTemplate({ protocolo: data.protocolo, tipo: data.tipo, prioridade: data.prioridade, comiteOrigem: data.comiteOrigem, comiteDestino: data.comiteDestino, motivo: data.motivo, linkAdmin });
    return this.send({ to: data.emails, subject: template.subject, html: template.html, text: template.text });
  }
}

export const emailService = new EmailService();
