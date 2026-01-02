import { ComitesRepository, CreateComiteDTO, UpdateComiteDTO, ComitesFilters } from './comites.repository';
import { UsuariosRepository } from '../usuarios/usuarios.repository';
import { AppError } from '@middlewares/error-handler';
import { logger } from '@utils/logger';

export class ComitesService {
  private repository: ComitesRepository;
  private usuariosRepository: UsuariosRepository;

  constructor() {
    this.repository = new ComitesRepository();
    this.usuariosRepository = new UsuariosRepository();
  }

  async listar(filters: ComitesFilters) {
    try {
      logger.info({ filters }, 'Listando comitês');

      const result = await this.repository.findAll(filters);

      return {
        success: true,
        data: result.data.map(c => ({
          id: c.id,
          nome: c.nome,
          descricao: c.descricao,
          ativo: c.ativo,
          total_membros: parseInt(c.total_membros),
          criado_em: c.criado_em,
          atualizado_em: c.atualizado_em
        })),
        pagination: result.pagination
      };
    } catch (error) {
      logger.error({ error, filters }, 'Erro ao listar comitês');
      throw new AppError('Erro ao listar comitês', 500);
    }
  }

  async getById(id: string) {
    const comite = await this.repository.findById(id);

    if (!comite) {
      throw new AppError('Comitê não encontrado', 404);
    }

    // Buscar membros do comitê
    const membros = await this.repository.getMembros(id);

    // Contar relatos
    const totalRelatos = await this.repository.countRelatos(id);

    return {
      success: true,
      comite: {
        id: comite.id,
        nome: comite.nome,
        descricao: comite.descricao,
        ativo: comite.ativo,
        criado_em: comite.criado_em,
        atualizado_em: comite.atualizado_em,
        total_relatos: totalRelatos,
        membros: membros.map(m => ({
          id: m.id,
          nome: m.nome,
          email: m.email,
          tipo: m.tipo,
          ativo: m.ativo
        }))
      }
    };
  }

  async criar(data: CreateComiteDTO, adminId: string) {
    // Verificar se nome já existe
    const existente = await this.repository.findByNome(data.nome);
    if (existente) {
      throw new AppError('Já existe um comitê com esse nome', 400);
    }

    const comite = await this.repository.create(data);

    logger.info({ comiteId: comite.id, adminId }, 'Comitê criado');

    return {
      success: true,
      message: 'Comitê criado com sucesso',
      comite: {
        id: comite.id,
        nome: comite.nome,
        descricao: comite.descricao,
        ativo: comite.ativo
      }
    };
  }

  async atualizar(id: string, data: UpdateComiteDTO, adminId: string) {
    const comite = await this.repository.findById(id);

    if (!comite) {
      throw new AppError('Comitê não encontrado', 404);
    }

    // Se está alterando nome, verificar se já existe
    if (data.nome && data.nome.toLowerCase() !== comite.nome.toLowerCase()) {
      const existente = await this.repository.findByNome(data.nome);
      if (existente) {
        throw new AppError('Já existe um comitê com esse nome', 400);
      }
    }

    const atualizado = await this.repository.update(id, data);

    logger.info({ comiteId: id, adminId, changes: data }, 'Comitê atualizado');

    return {
      success: true,
      message: 'Comitê atualizado com sucesso',
      comite: {
        id: atualizado.id,
        nome: atualizado.nome,
        descricao: atualizado.descricao,
        ativo: atualizado.ativo
      }
    };
  }

  async desativar(id: string, adminId: string) {
    const comite = await this.repository.findById(id);

    if (!comite) {
      throw new AppError('Comitê não encontrado', 404);
    }

    if (!comite.ativo) {
      throw new AppError('Comitê já está desativado', 400);
    }

    await this.repository.deactivate(id);

    logger.info({ comiteId: id, adminId }, 'Comitê desativado');

    return {
      success: true,
      message: 'Comitê desativado com sucesso'
    };
  }

  async reativar(id: string, adminId: string) {
    const comite = await this.repository.findById(id);

    if (!comite) {
      throw new AppError('Comitê não encontrado', 404);
    }

    if (comite.ativo) {
      throw new AppError('Comitê já está ativo', 400);
    }

    await this.repository.activate(id);

    logger.info({ comiteId: id, adminId }, 'Comitê reativado');

    return {
      success: true,
      message: 'Comitê reativado com sucesso'
    };
  }

  async excluir(id: string, adminId: string) {
    const comite = await this.repository.findById(id);

    if (!comite) {
      throw new AppError('Comitê não encontrado', 404);
    }

    // Verificar se há relatos vinculados
    const totalRelatos = await this.repository.countRelatos(id);
    if (totalRelatos > 0) {
      throw new AppError(`Não é possível excluir: existem ${totalRelatos} relatos vinculados a este comitê`, 400);
    }

    // Remover membros do comitê antes de excluir
    const membros = await this.repository.getMembros(id);
    for (const membro of membros) {
      await this.repository.removeMembro(membro.id);
    }

    await this.repository.delete(id);

    logger.info({ comiteId: id, adminId }, 'Comitê excluído');

    return {
      success: true,
      message: 'Comitê excluído com sucesso'
    };
  }

  async addMembro(comiteId: string, usuarioId: string, adminId: string) {
    const comite = await this.repository.findById(comiteId);

    if (!comite) {
      throw new AppError('Comitê não encontrado', 404);
    }

    const usuario = await this.usuariosRepository.findById(usuarioId);

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (usuario.comite_id === comiteId) {
      throw new AppError('Usuário já é membro deste comitê', 400);
    }

    await this.repository.addMembro(comiteId, usuarioId);

    logger.info({ comiteId, usuarioId, adminId }, 'Membro adicionado ao comitê');

    return {
      success: true,
      message: 'Membro adicionado com sucesso'
    };
  }

  async removeMembro(comiteId: string, usuarioId: string, adminId: string) {
    const comite = await this.repository.findById(comiteId);

    if (!comite) {
      throw new AppError('Comitê não encontrado', 404);
    }

    const usuario = await this.usuariosRepository.findById(usuarioId);

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (usuario.comite_id !== comiteId) {
      throw new AppError('Usuário não é membro deste comitê', 400);
    }

    await this.repository.removeMembro(usuarioId);

    logger.info({ comiteId, usuarioId, adminId }, 'Membro removido do comitê');

    return {
      success: true,
      message: 'Membro removido com sucesso'
    };
  }
}