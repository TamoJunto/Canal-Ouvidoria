import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticateToken } from '@middlewares/auth.middleware';

const router = Router();
const controller = new DashboardController();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/dashboard - Dashboard completo (todos os dados)
router.get('/', controller.getDashboard);

// GET /api/dashboard/kpis - KPIs gerais
router.get('/kpis', controller.getKPIs);

// GET /api/dashboard/por-status - Relatos por status
router.get('/por-status', controller.getPorStatus);

// GET /api/dashboard/por-tipo - Relatos por tipo
router.get('/por-tipo', controller.getPorTipo);

// GET /api/dashboard/por-prioridade - Relatos por prioridade
router.get('/por-prioridade', controller.getPorPrioridade);

// GET /api/dashboard/por-comite - Relatos por comitê
router.get('/por-comite', controller.getPorComite);

// GET /api/dashboard/por-periodo - Relatos por período (últimos 12 meses)
router.get('/por-periodo', controller.getPorPeriodo);

// GET /api/dashboard/tempo-medio - Tempo médio de resolução
router.get('/tempo-medio', controller.getTempoMedio);

// GET /api/dashboard/exportar - Exportar relatório
// OPERADOR: dados resumidos (sem info do denunciante)
// ADMIN_MASTER: dados completos (com todas as informações)
router.get('/exportar', controller.exportar);

export default router;