import pino from 'pino';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_PRETTY = process.env.LOG_PRETTY === 'true';

export const logger = pino({
  level: LOG_LEVEL,
  transport: LOG_PRETTY
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV || 'development',
  },
});

// Helper para redação de informações sensíveis
export function redactSensitiveData(data: any): any {
  if (!data) return data;

  const sensitiveKeys = [
    'password',
    'senha',
    'token',
    'secret',
    'authorization',
    'cookie',
    'cpf',
    'rg',
    'credit_card',
  ];

  if (typeof data === 'object') {
    const redacted = { ...data };
    
    for (const key of Object.keys(redacted)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = redactSensitiveData(redacted[key]);
      }
    }
    
    return redacted;
  }

  return data;
}

// Logger específico para auditoria
export const auditLogger = logger.child({ type: 'audit' });

// Logger para requisições HTTP
export const httpLogger = logger.child({ type: 'http' });



