import { Request, Response, NextFunction } from 'express';
import { logger, redactSensitiveData } from '@utils/logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }

  // Se for um AppError, usa as propriedades definidas
  if (err instanceof AppError) {
    const errorResponse = {
      success: false,
      error: {
        message: err.message,
        code: err.code || 'INTERNAL_ERROR',
        ...(err.details && { details: redactSensitiveData(err.details) }),
      },
    };

    logger.error(
      {
        err: {
          message: err.message,
          stack: err.stack,
          code: err.code,
          details: redactSensitiveData(err.details),
        },
        req: {
          method: req.method,
          url: req.url,
          ip: req.ip,
        },
      },
      'Application error'
    );

    return res.status(err.statusCode).json(errorResponse);
  }

  // Erros de validação do Zod
  if (err.name === 'ZodError') {
    logger.warn({ err: redactSensitiveData(err), req: { method: req.method, url: req.url } }, 'Validation error');

    return res.status(400).json({
      success: false,
      error: {
        message: 'Erro de validação',
        code: 'VALIDATION_ERROR',
        details: (err as any).errors,
      },
    });
  }

  // Erros do JWT
  if (err.message === 'TOKEN_EXPIRED') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED',
      },
    });
  }

  if (err.message === 'TOKEN_INVALID') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token inválido',
        code: 'TOKEN_INVALID',
      },
    });
  }

  // Erro genérico (não tratado)
  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
      req: {
        method: req.method,
        url: req.url,
        headers: redactSensitiveData(req.headers),
        body: redactSensitiveData(req.body),
        ip: req.ip,
      },
    },
    'Unhandled error'
  );

  // Em produção, não expõe detalhes do erro
  const isDevelopment = process.env.NODE_ENV === 'development';

  return res.status(500).json({
    success: false,
    error: {
      message: isDevelopment ? err.message : 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      ...(isDevelopment && { stack: err.stack }),
    },
  });
}

// Handler para rotas não encontradas
export function notFoundHandler(req: Request, res: Response) {
  logger.warn({ req: { method: req.method, url: req.url, ip: req.ip } }, 'Route not found');

  res.status(404).json({
    success: false,
    error: {
      message: 'Rota não encontrada',
      code: 'ROUTE_NOT_FOUND',
      path: req.url,
    },
  });
}

// Wrapper para async handlers
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}



