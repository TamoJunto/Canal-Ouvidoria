import nodemailer from 'nodemailer';
import { logger } from '@utils/logger';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  // Adicionei isso para evitar erro de TS
  tls?: {
    rejectUnauthorized: boolean;
  };
}

// Configuração para produção
const productionConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  // Mudei o fallback para 465, que é o ideal para SSL
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  // ISSO AQUI QUE CONSERTA O TIMEOUT:
  tls: {
    rejectUnauthorized: false
  }
};

// Cache do transporter
let transporter: nodemailer.Transporter | null = null;
let etherealAccount: { user: string; pass: string; web: string } | null = null;

/**
 * Cria uma conta de teste no Ethereal (para desenvolvimento)
 */
async function createEtherealAccount(): Promise<{ user: string; pass: string; web: string }> {
  if (etherealAccount) {
    return etherealAccount;
  }

  const testAccount = await nodemailer.createTestAccount();
  
  etherealAccount = {
    user: testAccount.user,
    pass: testAccount.pass,
    web: 'https://ethereal.email',
  };

  logger.info({
    user: etherealAccount.user,
    web: etherealAccount.web,
  }, '📧 Conta Ethereal criada para testes de email');

  console.log('\n' + '='.repeat(80));
  console.log('📧 ETHEREAL EMAIL - CONTA DE TESTE CRIADA');
  console.log('='.repeat(80));
  console.log(`👤 Usuário: ${etherealAccount.user}`);
  console.log(`🔑 Senha: ${etherealAccount.pass}`);
  console.log(`🌐 Ver emails em: ${etherealAccount.web}`);
  console.log(`   Faça login com as credenciais acima para ver os emails enviados`);
  console.log('='.repeat(80) + '\n');

  return etherealAccount;
}

/**
 * Obtém o transporter de email configurado
 */
export async function getEmailTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) {
    return transporter;
  }

  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (isDevelopment) {
    // Desenvolvimento: usar Ethereal (emails falsos)
    const account = await createEtherealAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });

    logger.info('Email transporter configurado com Ethereal (desenvolvimento)');
  } else {
    // Produção: usar SMTP configurado
    if (!productionConfig.auth.user || !productionConfig.auth.pass) {
      logger.warn('Credenciais SMTP não configuradas! Emails não serão enviados.');
      
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    } else {
      // Log para debug (sem mostrar a senha)
      console.log(`🔌 Conectando ao SMTP: ${productionConfig.host}:${productionConfig.port} (Secure: ${productionConfig.secure})`);
      
      transporter = nodemailer.createTransport(productionConfig);
      logger.info('Email transporter configurado com SMTP de produção');
    }
  }

  return transporter;
}

/**
 * Retorna a URL para visualizar emails no Ethereal
 */
export function getEtherealPreviewUrl(messageId: string): string | null {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return nodemailer.getTestMessageUrl({ messageId } as any) || null;
}

/**
 * Configurações gerais de email
 */
export const emailDefaults = {
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Canal de Ouvidoria',
    address: process.env.EMAIL_FROM_ADDRESS || 'noreply@ouvidoria.com.br',
  },
  replyTo: process.env.EMAIL_REPLY_TO || 'ouvidoria@empresa.com.br',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3002',
};

