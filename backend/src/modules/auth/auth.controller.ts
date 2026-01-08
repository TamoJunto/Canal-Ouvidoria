import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import {
  requestMagicLinkSchema,
  verifyMagicLinkSchema,
  refreshTokenSchema,
  logoutSchema,
} from './auth.validators';
import { logger } from '@utils/logger';

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  /**
   * POST /auth/magic-link
   * Solicita um magic link para autenticação
   */
  requestMagicLink = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Valida input
      const input = requestMagicLinkSchema.parse(req.body);

      // Extrai informações da requisição
      const ip = (req.ip || req.socket.remoteAddress || 'unknown').replace('::ffff:', '');
      const userAgent = req.headers['user-agent'] || null;

      // Processa requisição
      const result = await this.service.requestMagicLink({
        email: input.email,
        ip,
        userAgent,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/verify-magic-link
   * Verifica um magic link e retorna tokens
   */
  verifyMagicLink = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Valida input
      const input = verifyMagicLinkSchema.parse({
        token: req.query.token,
      });

      // Extrai informações da requisição
      const ip = (req.ip || req.socket.remoteAddress || 'unknown').replace('::ffff:', '');
      const userAgent = req.headers['user-agent'] || null;

      // Processa requisição
      const result = await this.service.verifyMagicLink({
        token: input.token,
        ip,
        userAgent,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/refresh
   * Renova tokens usando refresh token
   */
  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Valida input
      const input = refreshTokenSchema.parse(req.body);

      // Extrai informações da requisição
      const ip = (req.ip || req.socket.remoteAddress || 'unknown').replace('::ffff:', '');
      const userAgent = req.headers['user-agent'] || null;

      // Processa requisição
      const result = await this.service.refreshTokens({
        refreshToken: input.refreshToken,
        ip,
        userAgent,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/logout
   * Faz logout revogando tokens
   */
  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Valida input
      const input = logoutSchema.parse(req.body);

      // Se estiver autenticado, pega o userId
      const userId = req.user?.userId;

      // Verifica se é para revogar todas as sessões
      const revokeAll = req.body.revokeAll === true;

      // Processa requisição
      const result = await this.service.logout({
        refreshToken: input.refreshToken,
        userId,
        revokeAll,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/me
   * Retorna informações do usuário autenticado
   */
  me = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Não autenticado',
            code: 'NOT_AUTHENTICATED',
          },
        });
        return;
      }

      res.json({
        success: true,
        user: {
          id: req.user.userId,
          email: req.user.email,
          tipo: req.user.tipo,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/health
   * Health check do serviço de autenticação
   */
  health = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      res.json({
        success: true,
        service: 'auth',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}



