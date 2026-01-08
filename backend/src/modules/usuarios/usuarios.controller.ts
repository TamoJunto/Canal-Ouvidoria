import { Request, Response, NextFunction } from 'express';
import { UsuariosService } from './usuarios.service';
import { AppError } from '@middlewares/error-handler';

export class UsuariosController {
  private service: UsuariosService;

  constructor() {
    this.service = new UsuariosService();
  }

  listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const filters = {
        tipo: req.query.tipo as string,
        ativo: req.query.ativo !== undefined ? req.query.ativo === 'true' : undefined,
        comiteId: req.query.comiteId as string,
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

  getById = async (req: Request, res: Response, next: NextFunction) => {
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

  criar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { nome, email, tipo, comiteId } = req.body;

      const result = await this.service.criar(
        { nome, email, tipo, comiteId },
        req.user.userId
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  atualizar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      const { nome, email, tipo, comiteId } = req.body;

      const result = await this.service.atualizar(
        id,
        { nome, email, tipo, comiteId },
        req.user.userId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  desativar = async (req: Request, res: Response, next: NextFunction) => {
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

  reativar = async (req: Request, res: Response, next: NextFunction) => {
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

  excluir = async (req: Request, res: Response, next: NextFunction) => {
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
}