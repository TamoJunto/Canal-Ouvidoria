import { Router } from 'express';
import { UsuariosController } from './usuarios.controller';
import { authenticateToken, requireAdminMaster } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/validate.middleware';
import {
  createUsuarioSchema,
  updateUsuarioSchema,
  getUsuarioSchema
} from './usuarios.validators';

const router = Router();
const controller = new UsuariosController();

// Todas as rotas requerem autenticação e ser Admin Master
router.use(authenticateToken);
router.use(requireAdminMaster);

// GET /api/usuarios - Listar usuários
router.get('/', controller.listar);

// GET /api/usuarios/:id - Ver detalhes
router.get('/:id', validate(getUsuarioSchema), controller.getById);

// POST /api/usuarios - Criar usuário
router.post('/', validate(createUsuarioSchema), controller.criar);

// PUT /api/usuarios/:id - Atualizar usuário
router.put('/:id', validate(updateUsuarioSchema), controller.atualizar);

// DELETE /api/usuarios/:id - Desativar usuário
router.delete('/:id', validate(getUsuarioSchema), controller.desativar);

// POST /api/usuarios/:id/reativar - Reativar usuário
router.post('/:id/reativar', validate(getUsuarioSchema), controller.reativar);

export default router;