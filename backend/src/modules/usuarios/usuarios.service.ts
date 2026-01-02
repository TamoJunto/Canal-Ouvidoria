import { UsuariosRepository, CreateUsuarioDTO, UpdateUsuarioDTO, UsuariosFilters } from './usuarios.repository';
import { AppError } from '@middlewares/error-handler';
import { logger } from '@utils/logger';

export class UsuariosService {
  private repository: UsuariosRepository;

  constructor() {
    this.repository = new UsuariosRepository();
  }

  async listar(filters: UsuariosFilters) {
    try {
      logger.info({ filters }, 'Listando usuários');

      const result = await this.repository.findAll(filters);

      return {
        success: true,
        data: result.data.map(u => ({
          id: u.id,
          nome: u.nome,
          email: u.email,
          tipo: u.tipo,
          ativo: u.ativo,
          comite_id: u.comite_id,
          comite_nome: u.comite_nome,
          criado_em: u.criado_em,
          atualizado_em: u.atualizado_em
        })),
        pagination: result.pagination
      };
    } catch (error) {
      logger.error({ error, filters }, 'Erro ao listar usuários');
      throw new AppError('Erro ao listar usuários', 500);
    }
  }

  async getById(id: string) {
    const usuario = await this.repository.findById(id);

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return {
      success: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        ativo: usuario.ativo,
        comite_id: usuario.comite_id,
        comite_nome: usuario.comite_nome,
        criado_em: usuario.criado_em,
        atualizado_em: usuario.atualizado_em
      }
    };
  }

  async criar(data: CreateUsuarioDTO, adminId: string) {
    // Verificar se email já existe
    const existente = await this.repository.findByEmail(data.email);
    if (existente) {
      throw new AppError('Email já cadastrado', 400);
    }

    const usuario = await this.repository.create(data);

    logger.info({ usuarioId: usuario.id, adminId }, 'Usuário criado');

    return {
      success: true,
      message: 'Usuário criado com sucesso',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        ativo: usuario.ativo
      }
    };
  }

  async atualizar(id: string, data: UpdateUsuarioDTO, adminId: string) {
    const usuario = await this.repository.findById(id);

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Se está alterando email, verificar se já existe
    if (data.email && data.email !== usuario.email) {
      const existente = await this.repository.findByEmail(data.email);
      if (existente) {
        throw new AppError('Email já cadastrado', 400);
      }
    }

    const atualizado = await this.repository.update(id, data);

    logger.info({ usuarioId: id, adminId, changes: data }, 'Usuário atualizado');

    return {
      success: true,
      message: 'Usuário atualizado com sucesso',
      usuario: {
        id: atualizado.id,
        nome: atualizado.nome,
        email: atualizado.email,
        tipo: atualizado.tipo,
        ativo: atualizado.ativo,
        comite_id: atualizado.comite_id
      }
    };
  }

  async desativar(id: string, adminId: string) {
    const usuario = await this.repository.findById(id);

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (!usuario.ativo) {
      throw new AppError('Usuário já está desativado', 400);
    }

    // Não permitir desativar a si mesmo
    if (id === adminId) {
      throw new AppError('Você não pode desativar sua própria conta', 400);
    }

    await this.repository.deactivate(id);

    logger.info({ usuarioId: id, adminId }, 'Usuário desativado');

    return {
      success: true,
      message: 'Usuário desativado com sucesso'
    };
  }

  async reativar(id: string, adminId: string) {
    const usuario = await this.repository.findById(id);

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (usuario.ativo) {
      throw new AppError('Usuário já está ativo', 400);
    }

    await this.repository.activate(id);

    logger.info({ usuarioId: id, adminId }, 'Usuário reativado');

    return {
      success: true,
      message: 'Usuário reativado com sucesso'
    };
  }

  async excluir(id: string, adminId: string) {
    const usuario = await this.repository.findById(id);

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Não permitir excluir a si mesmo
    if (id === adminId) {
      throw new AppError('Você não pode excluir sua própria conta', 400);
    }

    await this.repository.delete(id);

    logger.info({ usuarioId: id, adminId }, 'Usuário excluído');

    return {
      success: true,
      message: 'Usuário excluído com sucesso'
    };
  }
}