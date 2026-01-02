import { Request, Response, NextFunction } from 'express';
import { ComitesService } from './comites.service';
import { AppError } from '@middlewares/error-handler';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    tipo: string;
  };
}

export class ComitesController {
  private service: ComitesService;

  constructor() {
    this.service = new ComitesService();
  }

  listar = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const filters = {
        ativo: req.query.ativo !== undefined ? req.query.ativo === 'true' : undefined,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const result = await this.service.listar(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      const result = await this.service.getById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  criar = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { nome, descricao } = req.body;

      const result = await this.service.criar(
        { nome, descricao },
        req.user.userId
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  atualizar = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      const { nome, descricao } = req.body;

      const result = await this.service.atualizar(
        id,
        { nome, descricao },
        req.user.userId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  desativar = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      const result = await this.service.desativar(id, req.user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  reativar = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      const result = await this.service.reativar(id, req.user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  excluir = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      const result = await this.service.excluir(id, req.user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  addMembro = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      const { usuarioId } = req.body;

      const result = await this.service.addMembro(id, usuarioId, req.user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  removeMembro = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id, usuarioId } = req.params;

      const result = await this.service.removeMembro(id, usuarioId, req.user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}