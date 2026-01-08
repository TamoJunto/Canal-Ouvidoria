import { Pool, PoolConfig } from 'pg';
import { logger } from '@utils/logger';

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'canal_ouvidoria',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  min: parseInt(process.env.DB_POOL_MIN || '2'),
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

export const pool = new Pool(poolConfig);

// Event listeners
pool.on('connect', () => {
  logger.debug('Nova conexão estabelecida com o banco de dados');
});

pool.on('error', (err) => {
  logger.error({ err }, 'Erro inesperado no pool de conexões do PostgreSQL');
  process.exit(-1);
});

pool.on('remove', () => {
  logger.debug('Conexão removida do pool');
});

// Health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('Conexão com banco de dados verificada com sucesso');
    return true;
  } catch (error) {
     const err = error as Error;
     logger.error({
      message: err.message,
      stack: err.stack,
      name: err.name
     }, 'Falha ao conectar com o banco de dados');
    
    
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await pool.end();
    logger.info('Pool de conexões do banco de dados fechado');
  } catch (error) {
    logger.error({ error }, 'Erro ao fechar pool de conexões');
  }
}




