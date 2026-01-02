import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { logger } from '@utils/logger';
import { checkDatabaseConnection, closeDatabaseConnection } from '@config/database';
import { connectRedis, closeRedis } from '@config/redis';
import { errorHandler, notFoundHandler } from '@middlewares/error-handler';
import { generalRateLimiter } from '@middlewares/rate-limit.middleware';
import authRoutes from '@modules/auth/auth.routes';
import relatosPublicRoutes from '@modules/relatos/public/relatos-public.routes';
import { initDatabase } from '@config/database'
import { initStorage } from '@config/storage'
import relatosAuthRoutes from '@modules/relatos/authenticated/relatos-auth.routes';
import usuariosRoutes from '@modules/usuarios/usuarios.routes';
import comitesRoutes from '@modules/comites/comites.routes';
import dashboardRoutes from '@modules/dashboard/dashboard.routes';


const app: Application = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// MIDDLEWARES GLOBAIS
// ============================================================================

// Segurança
app.use(helmet());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3002', // Frontend Vite (porta alternativa)
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (ex: Postman, mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn({ origin }, 'Origem não permitida tentou acessar a API');
        callback(new Error('Não permitido pelo CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger HTTP
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === '/health' || req.url === '/api/health',
    },
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn';
      } else if (res.statusCode >= 500 || err) {
        return 'error';
      }
      return 'info';
    },
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
  })
);

// Rate limiting geral
// Temporariamente desabilitado para desenvolvimento
// app.use(generalRateLimiter);

// ============================================================================
// ROTAS
// ============================================================================

// Health check simples
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    service: 'Canal de Ouvidoria API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/public/relatos', relatosPublicRoutes);
app.use('/api/relatos', relatosAuthRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/comites', comitesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ============================================================================
// ERROR HANDLERS
// ============================================================================

// 404 - Rota não encontrada
app.use(notFoundHandler);

// Error handler global
app.use(errorHandler);

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

async function startServer(): Promise<void> {
  try {
    // Conecta ao banco de dados
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      throw new Error('Falha ao conectar com o banco de dados');
    }

    // Tenta conectar ao Redis (com fallback em memória se falhar)
    await connectRedis();

    // inicia o storage
    initStorage();

    // Inicia o servidor
    app.listen(PORT, () => {
      logger.info(
        {
          port: PORT,
          environment: process.env.NODE_ENV || 'development',
        },
        'Servidor iniciado com sucesso'
      );

      logger.info(`🚀 API rodando em http://localhost:${PORT}`);
      logger.info(`📊 Health check em http://localhost:${PORT}/health`);
      logger.info(`🔐 Auth endpoints em http://localhost:${PORT}/api/auth`);
      logger.info(`📝 Relatos públicos em http://localhost:${PORT}/api/public/relatos`);
    });
  } catch (error) {
    logger.error({ error }, 'Falha ao iniciar servidor');
    process.exit(1);
  }
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Recebido sinal de encerramento');

  try {
    // Fecha conexões
    await Promise.all([
      closeDatabaseConnection(),
      closeRedis(),
    ]);

    logger.info('Servidor encerrado graciosamente');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Erro durante encerramento gracioso');
    process.exit(1);
  }
}

// Registra handlers para sinais de encerramento
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handler para erros não tratados
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection');
});

process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught Exception');
  shutdown('UNCAUGHT_EXCEPTION');
});

// Inicia o servidor
startServer();

export default app;



