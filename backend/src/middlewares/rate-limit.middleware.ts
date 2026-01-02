import { Request, Response, NextFunction } from 'express';
import { RedisService } from '@config/redis';
import { AppError } from './error-handler';
import { logger } from '@utils/logger';

/**
 * Rate limiter baseado em Redis
 */
export class RateLimiter {
  private redis: RedisService;

  constructor() {
    this.redis = new RedisService();
  }

  /**
   * Cria middleware de rate limiting
   * @param options - configurações do rate limiter
   */
  createMiddleware(options: {
    windowMs: number; // janela de tempo em ms
    maxRequests: number; // máximo de requisições
    keyPrefix?: string; // prefixo para a chave no Redis
    skipSuccessfulRequests?: boolean; // não conta requisições bem-sucedidas
    keyGenerator?: (req: Request) => string; // gerador customizado de chave
  }) {
    const {
      windowMs,
      maxRequests,
      keyPrefix = 'rl',
      skipSuccessfulRequests = false,
      keyGenerator,
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Gera a chave para o rate limit
        const key = keyGenerator
          ? `${keyPrefix}:${keyGenerator(req)}`
          : `${keyPrefix}:${req.ip}`;

        // Incrementa o contador
        const current = await this.redis.incrementWithExpiry(
          key,
          Math.ceil(windowMs / 1000)
        );

        // Headers informativos
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
        res.setHeader('X-RateLimit-Reset', Date.now() + windowMs);

        // Verifica se excedeu o limite
        if (current > maxRequests) {
          const ttl = await this.redis.ttl(key);
          const resetTime = new Date(Date.now() + ttl * 1000);

          logger.warn(
            {
              ip: req.ip,
              path: req.path,
              current,
              limit: maxRequests,
              resetAt: resetTime,
            },
            'Rate limit exceeded'
          );

          res.setHeader('Retry-After', ttl);

          throw new AppError(
            `Muitas requisições. Tente novamente em ${ttl} segundos.`,
            429,
            'RATE_LIMIT_EXCEEDED',
            {
              retryAfter: ttl,
              resetAt: resetTime,
            }
          );
        }

        // Se skipSuccessfulRequests está ativado, decrementa em caso de sucesso
        if (skipSuccessfulRequests) {
          res.on('finish', () => {
            if (res.statusCode < 400) {
              this.redis.increment(key).then((count) => {
                // Decrementa (incrementa com valor negativo não é possível, então recalcula)
                return this.redis.set(key, (count - 1).toString());
              });
            }
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Rate limiter específico por email
   */
  emailRateLimiter(options: { windowMs: number; maxRequests: number; emailField?: string }) {
    return this.createMiddleware({
      ...options,
      keyPrefix: 'rl_email',
      keyGenerator: (req) => {
        const email = req.body[options.emailField || 'email'];
        return email || req.ip;
      },
    });
  }

  /**
   * Rate limiter por IP
   */
  ipRateLimiter(options: { windowMs: number; maxRequests: number }) {
    return this.createMiddleware({
      ...options,
      keyPrefix: 'rl_ip',
      keyGenerator: (req) => req.ip || 'unknown',
    });
  }

  /**
   * Rate limiter por usuário autenticado
   */
  userRateLimiter(options: { windowMs: number; maxRequests: number }) {
    return this.createMiddleware({
      ...options,
      keyPrefix: 'rl_user',
      keyGenerator: (req) => {
        return req.user?.userId || req.ip || 'unknown';
      },
    });
  }
}

// Instância singleton
const rateLimiter = new RateLimiter();

// Exporta middlewares pré-configurados

/**
 * Rate limiter geral para todas as rotas públicas
 * 30 requisições por minuto por IP
 */
export const generalRateLimiter = rateLimiter.ipRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minuto
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '30'),
});

/**
 * Rate limiter para criação de relatos
 * 10 relatos por hora por IP
 */
export const relatoCreationRateLimiter = rateLimiter.ipRateLimiter({
  windowMs: 3600000, // 1 hora
  maxRequests: parseInt(process.env.RATE_LIMIT_RELATOS_MAX || '10'),
});

/**
 * Rate limiter para magic link
 * 3 tentativas por hora por email, 10 por hora por IP
 */
export const magicLinkEmailRateLimiter = rateLimiter.emailRateLimiter({
  windowMs: 3600000, // 1 hora
  maxRequests: parseInt(process.env.MAGIC_LINK_RATE_LIMIT_EMAIL || '3'),
});

export const magicLinkIpRateLimiter = rateLimiter.ipRateLimiter({
  windowMs: 3600000, // 1 hora
  maxRequests: parseInt(process.env.MAGIC_LINK_RATE_LIMIT_IP || '10'),
});

/**
 * Rate limiter para mensagens públicas
 * 5 mensagens por dia por relato
 */
export const mensagemPublicaRateLimiter = rateLimiter.createMiddleware({
  windowMs: 86400000, // 24 horas
  maxRequests: 5,
  keyPrefix: 'rl_msg',
  keyGenerator: (req) => `${req.params.protocol}:${req.ip}`,
});



