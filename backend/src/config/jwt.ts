import jwt from 'jsonwebtoken';
import { logger } from '@utils/logger';

export interface JWTPayload {
  userId: string;
  email: string;
  tipo: 'ADMIN_MASTER' | 'OPERADOR';
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Chaves RSA (devem ser geradas e colocadas no .env)
// Gerar com: ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n') || '';

const ACCESS_TOKEN_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
const REFRESH_TOKEN_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

if (!PRIVATE_KEY || !PUBLIC_KEY) {
  logger.warn('Chaves JWT não configuradas! Usando algoritmo HS256 (NÃO RECOMENDADO EM PRODUÇÃO)');
}

export class JWTService {
  /**
   * Gera um par de tokens (access + refresh)
   */
  static generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Gera um access token (curta duração)
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    if (PRIVATE_KEY) {
      return jwt.sign(payload, PRIVATE_KEY, {
        algorithm: 'RS256',
        expiresIn: ACCESS_TOKEN_EXPIRATION as string,
      });
    }

    // Fallback para desenvolvimento (não usar em produção!)
    return jwt.sign(payload, 'dev-secret-key', {
      algorithm: 'HS256',
      expiresIn: ACCESS_TOKEN_EXPIRATION as string,
    });
  }

  /**
   * Gera um refresh token (longa duração)
   */
  static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    if (PRIVATE_KEY) {
      return jwt.sign(payload, PRIVATE_KEY, {
        algorithm: 'RS256',
        expiresIn: REFRESH_TOKEN_EXPIRATION as string,
      });
    }

    // Fallback para desenvolvimento
    return jwt.sign(payload, 'dev-secret-key', {
      algorithm: 'HS256',
      expiresIn: REFRESH_TOKEN_EXPIRATION as string,
    });
  }

  /**
   * Verifica e decodifica um token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      if (PUBLIC_KEY) {
        return jwt.verify(token, PUBLIC_KEY, {
          algorithms: ['RS256'],
        }) as JWTPayload;
      }

      // Fallback para desenvolvimento
      return jwt.verify(token, 'dev-secret-key', {
        algorithms: ['HS256'],
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('TOKEN_INVALID');
      }
      throw new Error('TOKEN_VERIFICATION_FAILED');
    }
  }

  /**
   * Decodifica um token sem verificar a assinatura (útil para debug)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Verifica se um token está expirado (sem lançar erro)
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Extrai o payload sem verificar (para tokens já verificados)
   */
  static getPayload(token: string): JWTPayload | null {
    return this.decodeToken(token);
  }
}

// Função auxiliar para converter tempo de expiração em segundos
export function getExpirationInSeconds(expiration: string): number {
  const unit = expiration.slice(-1);
  const value = parseInt(expiration.slice(0, -1));

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
    default:
      return 900; // 15 minutos padrão
  }
}



