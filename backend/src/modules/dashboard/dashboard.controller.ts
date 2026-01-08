import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { AppError } from '@middlewares/error-handler';

export class DashboardController {
  private service: DashboardService;

  constructor() {
    this.service = new DashboardService();
  }

  private getFilters(req: Request) {
    return {
      dataInicio: req.query.dataInicio ? new Date(req.query.dataInicio as string) : undefined,
      dataFim: req.query.dataFim ? new Date(req.query.dataFim as string) : undefined,
      comiteId: req.query.comiteId as string,
      tipoOcorrencia: req.query.tipoOcorrencia as string
    };
  }

  // GET /api/dashboard - Dashboard completo
  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const filters = this.getFilters(req);
      const result = await this.service.getDashboardCompleto(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/dashboard/kpis
  getKPIs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const filters = this.getFilters(req);
      const result = await this.service.getKPIs(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/dashboard/por-status
  getPorStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const filters = this.getFilters(req);
      const result = await this.service.getPorStatus(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/dashboard/por-tipo
  getPorTipo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const filters = this.getFilters(req);
      const result = await this.service.getPorTipo(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/dashboard/por-prioridade
  getPorPrioridade = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const filters = this.getFilters(req);
      const result = await this.service.getPorPrioridade(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/dashboard/por-comite
  getPorComite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const filters = this.getFilters(req);
      const result = await this.service.getPorComite(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/dashboard/por-periodo
  getPorPeriodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const filters = this.getFilters(req);
      const result = await this.service.getPorPeriodo(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/dashboard/tempo-medio
  getTempoMedio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const filters = this.getFilters(req);
      const result = await this.service.getTempoMedio(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/dashboard/exportar
  exportar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const filters = this.getFilters(req);
      
      // Passa o tipo do usuário para filtrar os dados
      const result = await this.service.exportar(filters, req.user.tipo);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}