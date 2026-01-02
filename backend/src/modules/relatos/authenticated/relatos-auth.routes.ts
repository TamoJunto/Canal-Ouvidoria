import { Router } from 'express';
import { RelatosAuthController } from './relatos-auth.controller';
import { authenticateToken } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/validate.middleware';
import {
  addComentarioSchema,
  transferirSchema,
  responderSchema,
  reabrirSchema,
  getRelatoSchema
} from './relatos-auth.validators';

const router = Router();
const controller = new RelatosAuthController();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/relatos - Listar relatos
router.get('/', controller.listar);

// GET /api/relatos/:id - Ver detalhes completos
router.get('/:id', validate(getRelatoSchema), controller.detalhes);

// POST /api/relatos/:id/iniciar - Iniciar tratamento
router.post('/:id/iniciar', validate(getRelatoSchema), controller.iniciar);

// POST /api/relatos/:id/comentarios - Adicionar comentário interno
router.post('/:id/comentarios', validate(addComentarioSchema), controller.addComentario);

// POST /api/relatos/:id/transferir - Transferir para outro comitê
router.post('/:id/transferir', validate(transferirSchema), controller.transferir);

// POST /api/relatos/:id/responder - Responder ao denunciante
router.post('/:id/responder', validate(responderSchema), controller.responder);

// POST /api/relatos/:id/finalizar - Marcar como finalizado
router.post('/:id/finalizar', validate(getRelatoSchema), controller.finalizar);

// POST /api/relatos/:id/reabrir - Reabrir relato
router.post('/:id/reabrir', validate(reabrirSchema), controller.reabrir);

export default router;