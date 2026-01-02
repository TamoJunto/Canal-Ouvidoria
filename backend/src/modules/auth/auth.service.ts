import { AuthRepository } from './auth.repository';
import { JWTService, TokenPair, getExpirationInSeconds } from '@config/jwt';
import { generateSecureToken, generateDeviceFingerprint, timingSafeEqual } from '@utils/crypto';
import { logger } from '@utils/logger';
import { AppError } from '@middlewares/error-handler';
import { RedisService } from '@config/redis';
import { emailService } from '@modules/email/email.service';

export class AuthService {
  private repository: AuthRepository;
  private redis: RedisService;

  constructor() {
    this.repository = new AuthRepository();
    this.redis = new RedisService();
  }

  /**
   * Solicita um magic link para autenticação
   */
  async requestMagicLink(data: {
    email: string;
    ip: string;
    userAgent: string | null;
  }): Promise<{success: boolean; message: string; magicLink?: string}> {
    const { email, ip, userAgent } = data;

    // Verifica se o usuário existe e está ativo
    const user = await this.repository.findUserByEmail(email);

    if (!user) {
      // Por segurança, não revela se o email existe ou não
      logger.warn({ email, ip }, 'Tentativa de magic link para email não cadastrado');
      
      return {
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um link de acesso.',
      };
    }

    if (!user.ativo) {
      logger.warn({ userId: user.id, email, ip }, 'Tentativa de magic link para usuário inativo');
      
      throw new AppError(
        'Usuário inativo. Entre em contato com o administrador.',
        403,
        'USER_INACTIVE'
      );
    }

    // Gera token seguro
    const token = generateSecureToken(32);
    const expirationInSeconds = getExpirationInSeconds(
      process.env.MAGIC_LINK_EXPIRATION || '15m'
    );

    // Salva token no banco
    await this.repository.createMagicLinkToken({
      email,
      token,
      ip,
      userAgent,
      expiresIn: expirationInSeconds,
    });

    // Envia email com magic link usando o novo serviço
    try {
      const result = await emailService.sendMagicLink({
        email,
        nome: user.nome,
        token,
        ip,
      });

      if (!result.success) {
        throw new Error(result.error || 'Falha ao enviar email');
      }

      logger.info({ 
        email, 
        ip, 
        userId: user.id,
        previewUrl: result.previewUrl 
      }, 'Magic link enviado');

    } catch (error) {
      logger.error({ error, email }, 'Falha ao enviar magic link por email');
      throw new AppError('Falha ao enviar email. Tente novamente mais tarde.', 500, 'EMAIL_SEND_FAILED');
    }

    // EM DESENVOLVIMENTO: Retorna o magic link na resposta
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
    const magicLink = `${frontendUrl}/auth/verify?token=${token}`;
    
    if (isDevelopment) {
      console.log('\n' + '='.repeat(80));
      console.log('🔗 MAGIC LINK GERADO (MODO DESENVOLVIMENTO)');
      console.log('='.repeat(80));
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Link: ${magicLink}`);
      console.log('='.repeat(80) + '\n');
    }

    return {
      success: true,
      message: 'Se o email estiver cadastrado, você receberá um link de acesso.',
      ...(isDevelopment && { magicLink }), // Retorna o link apenas em desenvolvimento
    };
  }

  /**
   * Verifica um magic link e faz login
   */
  async verifyMagicLink(data: {
    token: string;
    ip: string;
    userAgent: string | null;
  }): Promise<{
    success: boolean;
    tokens: TokenPair;
    user: {
      id: string;
      nome: string;
      email: string;
      tipo: 'ADMIN_MASTER' | 'OPERADOR';
    };
  }> {
    const { token, ip, userAgent } = data;

    // Busca token no banco
    const magicLinkToken = await this.repository.findAndValidateMagicLinkToken(token);

    if (!magicLinkToken) {
      logger.warn({ ip, tokenPreview: token.substring(0, 8) }, 'Tentativa de uso de magic link inválido/expirado');
      
      throw new AppError(
        'Link inválido ou expirado. Solicite um novo link.',
        401,
        'INVALID_OR_EXPIRED_MAGIC_LINK'
      );
    }

    // Busca usuário
    const user = await this.repository.findUserByEmail(magicLinkToken.email);

    if (!user || !user.ativo) {
      logger.error({ email: magicLinkToken.email }, 'Usuário não encontrado ou inativo ao verificar magic link');
      
      throw new AppError(
        'Usuário não encontrado ou inativo.',
        401,
        'USER_NOT_FOUND_OR_INACTIVE'
      );
    }

    // Marca token como usado (proteção contra timing attacks)
    await this.repository.markMagicLinkTokenAsUsed(magicLinkToken.id);

    // Gera tokens JWT
    const tokens = JWTService.generateTokenPair({
      userId: user.id,
      email: user.email,
      tipo: user.tipo,
    });

    // Salva refresh token no banco
    const deviceFingerprint = generateDeviceFingerprint(userAgent || '', ip);
    const refreshTokenExpiration = getExpirationInSeconds(
      process.env.JWT_REFRESH_EXPIRATION || '7d'
    );

    await this.repository.createRefreshToken({
      userId: user.id,
      token: tokens.refreshToken,
      ip,
      userAgent,
      deviceFingerprint,
      expiresIn: refreshTokenExpiration,
    });

    // Log de auditoria
    logger.info(
      {
        userId: user.id,
        email: user.email,
        tipo: user.tipo,
        ip,
        deviceFingerprint,
      },
      'Usuário autenticado via magic link'
    );

    return {
      success: true,
      tokens,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
    };
  }

  /**
   * Renova os tokens usando refresh token
   */
  async refreshTokens(data: {
    refreshToken: string;
    ip: string;
    userAgent: string | null;
  }): Promise<{
    success: boolean;
    tokens: TokenPair;
  }> {
    const { refreshToken, ip, userAgent } = data;

    // Busca e valida refresh token
    const storedToken = await this.repository.findAndValidateRefreshToken(refreshToken);

    if (!storedToken) {
      logger.warn({ ip }, 'Tentativa de refresh com token inválido/expirado');
      
      throw new AppError(
        'Token inválido ou expirado. Faça login novamente.',
        401,
        'INVALID_OR_EXPIRED_REFRESH_TOKEN'
      );
    }

    // Verifica se o IP ou device mudou (possível roubo de token)
    const currentDeviceFingerprint = generateDeviceFingerprint(userAgent || '', ip);
    
    if (storedToken.device_fingerprint && storedToken.device_fingerprint !== currentDeviceFingerprint) {
      logger.warn(
        {
          userId: storedToken.usuario_id,
          storedFingerprint: storedToken.device_fingerprint,
          currentFingerprint: currentDeviceFingerprint,
          ip,
        },
        'Device fingerprint não coincide - possível roubo de token'
      );
      
      // Revoga todos os tokens do usuário por segurança
      await this.repository.revokeAllUserRefreshTokens(storedToken.usuario_id);
      
      throw new AppError(
        'Sessão inválida detectada. Por segurança, todas as sessões foram encerradas. Faça login novamente.',
        401,
        'SESSION_COMPROMISED'
      );
    }

    // Busca usuário
    const user = await this.repository.findUserById(storedToken.usuario_id);

    if (!user || !user.ativo) {
      throw new AppError('Usuário não encontrado ou inativo.', 401, 'USER_NOT_FOUND_OR_INACTIVE');
    }

    // Revoga o refresh token atual (rotation)
    await this.repository.revokeRefreshToken(storedToken.id);

    // Gera novos tokens
    const tokens = JWTService.generateTokenPair({
      userId: user.id,
      email: user.email,
      tipo: user.tipo,
    });

    // Salva novo refresh token
    const refreshTokenExpiration = getExpirationInSeconds(
      process.env.JWT_REFRESH_EXPIRATION || '7d'
    );

    await this.repository.createRefreshToken({
      userId: user.id,
      token: tokens.refreshToken,
      ip,
      userAgent,
      deviceFingerprint: currentDeviceFingerprint,
      expiresIn: refreshTokenExpiration,
    });

    logger.info({ userId: user.id, ip }, 'Tokens renovados');

    return {
      success: true,
      tokens,
    };
  }

  /**
   * Faz logout revogando o refresh token
   */
  async logout(data: {
    refreshToken?: string;
    userId?: string;
    revokeAll?: boolean;
  }): Promise<{ success: boolean; message: string }> {
    const { refreshToken, userId, revokeAll } = data;

    if (revokeAll && userId) {
      // Revoga todas as sessões do usuário
      await this.repository.revokeAllUserRefreshTokens(userId);
      logger.info({ userId }, 'Todas as sessões do usuário revogadas');
      
      return {
        success: true,
        message: 'Todas as sessões foram encerradas com sucesso.',
      };
    }

    if (refreshToken) {
      // Revoga apenas o refresh token específico
      const storedToken = await this.repository.findAndValidateRefreshToken(refreshToken);
      
      if (storedToken) {
        await this.repository.revokeRefreshToken(storedToken.id);
        logger.info({ userId: storedToken.usuario_id, tokenId: storedToken.id }, 'Sessão encerrada');
      }
    }

    return {
      success: true,
      message: 'Logout realizado com sucesso.',
    };
  }

  /**
   * Limpa tokens expirados (executar periodicamente via cron)
   */
  async cleanExpiredTokens(): Promise<void> {
    const [magicLinksDeleted, refreshTokensDeleted] = await Promise.all([
      this.repository.cleanExpiredMagicLinkTokens(),
      this.repository.cleanExpiredRefreshTokens(),
    ]);

    logger.info(
      {
        magicLinksDeleted,
        refreshTokensDeleted,
      },
      'Tokens expirados limpos'
    );
  }
}