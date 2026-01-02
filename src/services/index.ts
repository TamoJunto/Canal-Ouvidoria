/**
 * Exportação centralizada de todos os serviços de API
 */

export { apiClient, tokenManager } from './apiClient';

export * as authApi from './authApi';
export * as relatosPublicApi from './relatosPublicApi';
export * as relatosAuthApi from './relatosAuthApi';
export * as usuariosApi from './usuariosApi';
export * as comitesApi from './comitesApi';
export * as dashboardApi from './dashboardApi';

export * from './types/api.types';

