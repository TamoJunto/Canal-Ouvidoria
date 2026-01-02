import { Router } from 'express';
import { ComitesController } from './comites.controller';
import { authenticateToken, requireAdminMaster } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/validate.middleware';
import {
  createComiteSchema,
  updateComiteSchema,
  getComiteSchema,
  addMembroSchema,
  removeMembroSchema
} from './comites.validators';

const router = Router();
const controller = new ComitesController();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/comites - Listar comitês (qualquer autenticado)
router.get('/', controller.listar);

// GET /api/comites/:id - Ver detalhes (qualquer autenticado)
router.get('/:id', validate(getComiteSchema), controller.getById);

// Rotas abaixo requerem Admin Master
router.use(requireAdminMaster);

// POST /api/comites - Criar comitê
router.post('/', validate(createComiteSchema), controller.criar);

// PUT /api/comites/:id - Atualizar comitê
router.put('/:id', validate(updateComiteSchema), controller.atualizar);

// DELETE /api/comites/:id - Desativar comitê
router.delete('/:id', validate(getComiteSchema), controller.desativar);

// POST /api/comites/:id/reativar - Reativar comitê
router.post('/:id/reativar', validate(getComiteSchema), controller.reativar);

// POST /api/comites/:id/membros - Adicionar membro
router.post('/:id/membros', validate(addMembroSchema), controller.addMembro);

// DELETE /api/comites/:id/membros/:usuarioId - Remover membro
router.delete('/:id/membros/:usuarioId', validate(removeMembroSchema), controller.removeMembro);

export default router;