import { Pool, PoolConfig } from 'pg';
import { logger } from '@utils/logger';

// DEBUG: Log das variáveis de ambiente
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_SSL:', process.env.DB_SSL);    
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

let poolConfig: PoolConfig;

if (process.env.DATABASE_URL) {
  // Usar connection string direta
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
} else {
  // Fallback para variáveis individuais
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'canal_ouvidoria',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  };
}

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







