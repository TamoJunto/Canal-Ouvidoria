import { Router } from 'express';
import { RelatosPublicController } from './relatos-public.controller';
import { validate } from '@middlewares/validate.middleware'; 
import { createReportSchema, getReportSchema, createMessageSchema } from './relatos-public.validators';
import { relatoCreationRateLimiter, mensagemPublicaRateLimiter } from '@middlewares/rate-limit.middleware';
import { uploadMultiple } from '@middlewares/upload.middleware';
import { generalRateLimiter } from '@middlewares/rate-limit.middleware';


const router = Router();
const controller = new RelatosPublicController();

// POST /api/public/relatos - Criar novo relato
router.post('/', relatoCreationRateLimiter, validate(createReportSchema), controller.create);

// GET /api/public/relatos/:protocol - Consultar status
router.get('/:protocol', validate(getReportSchema), controller.show);

// POST /api/public/relatos/:protocol/mensagens - Enviar mensagem no relato
router.post('/:protocol/mensagens', mensagemPublicaRateLimiter, validate(createMessageSchema), controller.createMessage);

// POST /api/public/relatos/:protocol/anexos - Upload de arquivos
router.post(
  '/:protocol/anexos', 
  generalRateLimiter,
  uploadMultiple, // Multer middleware
  controller.uploadAttachments
);
  
// GET /api/public/relatos/:protocol/anexos - Listar anexos
router.get('/:protocol/anexos', controller.getAttachments);

// GET /api/public/relatos/:protocol/anexos/:attachmentId - Download de anexo
router.get('/:protocol/anexos/:attachmentId', controller.downloadAttachment);

export default router;