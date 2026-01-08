import { Request, Response, NextFunction } from 'express';
import { RelatosAuthService } from './relatos-auth.service';
import { AppError } from '@middlewares/error-handler';

export class RelatosAuthController {
  private service: RelatosAuthService;

  constructor() {
    this.service = new RelatosAuthService();
  }
  testLog = (req: Request, res: Response, next: NextFunction) => {
    console.log('=== PASSOU AQUI ===');
    console.log('req.user:', req.user);
    next();
  };

  listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const filters = {
        status: req.query.status ? (req.query.status as string).split(',') : undefined,
        tipo: req.query.tipo ? (req.query.tipo as string).split(',') : undefined,
        prioridade: req.query.prioridade ? (req.query.prioridade as string).split(',') : undefined,
        comiteId: req.query.comiteId as string,
        dataInicio: req.query.dataInicio ? new Date(req.query.dataInicio as string) : undefined,
        dataFim: req.query.dataFim ? new Date(req.query.dataFim as string) : undefined,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const result = await this.service.listarRelatos(filters, req.user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  detalhes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      const result = await this.service.getDetalhes(id, req.user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  iniciar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      const result = await this.service.iniciarTratamento(id, req.user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  addComentario = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('=== CONTROLLER ADD COMMENT ===');
        console.log('req.user:', req.user);
        console.log('params:', req.params);
        console.log('body:', req.body);

      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      const { conteudo } = req.body;

      console.log('Chamando service com usuarioId:', req.user.userId);
      const result = await this.service.addComentario(id, conteudo, req.user.userId);
      res.status(201).json(result);
    } catch (error) {
        console.log('Error:', error);
      next(error);
    }
  };

  transferir = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      const { comiteId, motivo } = req.body;

      const result = await this.service.transferir(id, comiteId, motivo, req.user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  responder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      const { resposta } = req.body;

      const result = await this.service.responder(id, resposta, req.user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  finalizar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      const result = await this.service.finalizar(id, req.user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  reabrir = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      const { motivo } = req.body;

      const result = await this.service.reabrir(id, motivo, req.user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}