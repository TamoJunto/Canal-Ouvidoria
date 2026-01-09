import { createClient, RedisClientType, RedisClientOptions } from 'redis';
import { logger } from '@utils/logger';

let redisClient: RedisClientType | null = null;
let useMemoryFallback = false;

export async function connectRedis(): Promise<RedisClientType | null> {
  
  if (process.env.REDIS_DISABLED === 'true') {
    logger.info('ℹ️ Redis desabilitado. Usando fallback em memória.');
    useMemoryFallback = true;
    return null;
  }
  
  if (redisClient) {
    return redisClient;
  }

  // Se já estamos usando fallback em memória, retorna null
  if (useMemoryFallback) {
    return null;
  }

  try {
    // --- MUDANÇA AQUI: Suporte para REDIS_URL (Render/Upstash) ---
    let connectionOptions: RedisClientOptions;

    if (process.env.REDIS_URL) {
      // Se tiver a URL completa (padrão Render/Upstash)
      connectionOptions = {
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 10000, // Timeout maior para garantir conexão externa
          tls: process.env.REDIS_URL.startsWith('rediss://') // Ativa TLS se for rediss
        }
      };
    } else {
      // Padrão antigo (Localhost ou variáveis separadas)
      connectionOptions = {
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          connectTimeout: 5000,
        },
        password: process.env.REDIS_PASSWORD || undefined,
        database: parseInt(process.env.REDIS_DB || '0'),
      };
    }

    redisClient = createClient(connectionOptions) as RedisClientType;
    // -------------------------------------------------------------

    redisClient.on('error', (err) => {
      logger.error({ err }, 'Erro no cliente Redis');
    });

    redisClient.on('connect', () => {
      logger.info('✅ Conectado ao Redis');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Cliente Redis pronto');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('⚠️ Reconectando ao Redis...');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.warn(
      { error },
      '⚠️ Não foi possível conectar ao Redis. Usando fallback em memória para desenvolvimento.'
    );
    logger.warn('💡 Para usar Redis em produção, instale e inicie o Redis ou use Docker: docker run -d -p 6379:6379 redis:alpine');
    
    useMemoryFallback = true;
    redisClient = null;
    return null;
  }
}

export function getRedisClient(): RedisClientType | null {
  return redisClient;
}

export function isUsingMemoryFallback(): boolean {
  return useMemoryFallback;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    logger.info('✅ Conexão Redis fechada');
  }
}

// ============================================================================
// FALLBACK EM MEMÓRIA (para desenvolvimento sem Redis)
// ============================================================================

interface MemoryStoreValue {
  value: string;
  expiresAt?: number;
}

class MemoryStore {
  private store: Map<string, MemoryStoreValue> = new Map();

  set(key: string, value: string, expirationInSeconds?: number): void {
    const expiresAt = expirationInSeconds 
      ? Date.now() + expirationInSeconds * 1000 
      : undefined;
    
    this.store.set(key, { value, expiresAt });
    this.cleanup();
  }

  get(key: string): string | null {
    const item = this.store.get(key);
    
    if (!item) {
      return null;
    }

    // Verifica se expirou
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  exists(key: string): boolean {
    const value = this.get(key);
    return value !== null;
  }

  increment(key: string): number {
    const current = this.get(key);
    const newValue = current ? parseInt(current) + 1 : 1;
    
    // Mantém a expiração se existir
    const item = this.store.get(key);
    const expiresAt = item?.expiresAt;
    
    this.store.set(key, { 
      value: newValue.toString(), 
      expiresAt 
    });
    
    return newValue;
  }

  expire(key: string, seconds: number): void {
    const item = this.store.get(key);
    if (item) {
      item.expiresAt = Date.now() + seconds * 1000;
    }
  }

  ttl(key: string): number {
    const item = this.store.get(key);
    
    if (!item || !item.expiresAt) {
      return -1;
    }

    const ttl = Math.ceil((item.expiresAt - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2;
  }

  // Limpa itens expirados periodicamente
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

const memoryStore = new MemoryStore();

// ============================================================================
// SERVIÇO REDIS COM FALLBACK AUTOMÁTICO
// ============================================================================

export class RedisService {
  async set(key: string, value: string, expirationInSeconds?: number): Promise<void> {
    const client = getRedisClient();
    
    if (client) {
      // Usa Redis
      if (expirationInSeconds) {
        await client.setEx(key, expirationInSeconds, value);
      } else {
        await client.set(key, value);
      }
    } else {
      // Usa memória
      memoryStore.set(key, value, expirationInSeconds);
    }
  }

  async get(key: string): Promise<string | null> {
    const client = getRedisClient();
    
    if (client) {
      return await client.get(key);
    } else {
      return memoryStore.get(key);
    }
  }

  async delete(key: string): Promise<void> {
    const client = getRedisClient();
    
    if (client) {
      await client.del(key);
    } else {
      memoryStore.delete(key);
    }
  }

  async exists(key: string): Promise<boolean> {
    const client = getRedisClient();
    
    if (client) {
      const result = await client.exists(key);
      return result === 1;
    } else {
      return memoryStore.exists(key);
    }
  }

  async increment(key: string): Promise<number> {
    const client = getRedisClient();
    
    if (client) {
      return await client.incr(key);
    } else {
      return memoryStore.increment(key);
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    const client = getRedisClient();
    
    if (client) {
      await client.expire(key, seconds);
    } else {
      memoryStore.expire(key, seconds);
    }
  }

  async ttl(key: string): Promise<number> {
    const client = getRedisClient();
    
    if (client) {
      return await client.ttl(key);
    } else {
      return memoryStore.ttl(key);
    }
  }

  // Para rate limiting
  async incrementWithExpiry(key: string, expirationInSeconds: number): Promise<number> {
    const client = getRedisClient();
    
    if (client) {
      const count = await client.incr(key);
      if (count === 1) {
        await client.expire(key, expirationInSeconds);
      }
      return count;
    } else {
      const count = memoryStore.increment(key);
      if (count === 1) {
        memoryStore.expire(key, expirationInSeconds);
      }
      return count;
    }
  }

  // Para tokens
  async setHash(key: string, field: string, value: string): Promise<void> {
    const client = getRedisClient();
    
    if (client) {
      await client.hSet(key, field, value);
    } else {
      // Para hashes, usamos uma chave combinada no fallback
      memoryStore.set(`${key}:${field}`, value);
    }
  }

  async getHash(key: string, field: string): Promise<string | undefined> {
    const client = getRedisClient();
    
    if (client) {
      return await client.hGet(key, field);
    } else {
      const value = memoryStore.get(`${key}:${field}`);
      return value ?? undefined;
    }
  }

  async getAllHash(key: string): Promise<Record<string, string>> {
    const client = getRedisClient();
    
    if (client) {
      return await client.hGetAll(key);
    } else {
      // Fallback simplificado: não suportamos getAllHash em memória
      logger.warn('getAllHash não suportado em modo fallback de memória');
      return {};
    }
  }
}
