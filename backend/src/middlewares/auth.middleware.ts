import { Request, Response, NextFunction } from 'express';
import { JWTService, JWTPayload } from '@config/jwt';
import { AppError } from './error-handler';
import { logger } from '@utils/logger';

// Extende o tipo Request do Express para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware para verificar autenticação via JWT
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('Token de autenticação não fornecido', 401, 'NO_TOKEN');
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AppError('Formato de token inválido', 401, 'INVALID_TOKEN_FORMAT');
    }

    const token = parts[1];

    try {
      const payload = JWTService.verifyToken(token);
      req.user = payload;
      
      logger.debug(
        {
          userId: payload.userId,
          email: payload.email,
          tipo: payload.tipo,
        },
        'User authenticated'
      );

      next();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'TOKEN_EXPIRED') {
          throw new AppError('Token expirado', 401, 'TOKEN_EXPIRED');
        }
        if (error.message === 'TOKEN_INVALID') {
          throw new AppError('Token inválido', 401, 'TOKEN_INVALID');
        }
      }
      throw new AppError('Falha na verificação do token', 401, 'TOKEN_VERIFICATION_FAILED');
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware para verificar se o usuário é Admin Master
 */
export function requireAdminMaster(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new AppError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED'));
  }

  if (req.user.tipo !== 'ADMIN_MASTER') {
    logger.warn(
      {
        userId: req.user.userId,
        tipo: req.user.tipo,
        requiredRole: 'ADMIN_MASTER',
      },
      'Unauthorized access attempt'
    );

    return next(new AppError('Acesso negado: requer permissão de Admin Master', 403, 'INSUFFICIENT_PERMISSIONS'));
  }

  next();
}

/**
 * Middleware para verificar se o usuário é Operador ou Admin Master
 */
export function requireOperador(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new AppError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED'));
  }

  const allowedRoles = ['OPERADOR', 'ADMIN_MASTER'];

  if (!allowedRoles.includes(req.user.tipo)) {
    logger.warn(
      {
        userId: req.user.userId,
        tipo: req.user.tipo,
        requiredRoles: allowedRoles,
      },
      'Unauthorized access attempt'
    );

    return next(new AppError('Acesso negado: requer permissão de Operador', 403, 'INSUFFICIENT_PERMISSIONS'));
  }

  next();
}

/**
 * Middleware opcional de autenticação (não falha se não houver token)
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');

      if (parts.length === 2 && parts[0] === 'Bearer') {
        try {
          const token = parts[1];
          const payload = JWTService.verifyToken(token);
          req.user = payload;
        } catch {
          // Ignora erro silenciosamente
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}



