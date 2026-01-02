// Setup para testes
// Configura timeout global
jest.setTimeout(10000);

// Configura variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.JWT_ACCESS_EXPIRATION = '15m';
process.env.JWT_REFRESH_EXPIRATION = '7d';



