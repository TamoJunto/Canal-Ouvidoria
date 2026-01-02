import { Request, Response, NextFunction } from 'express';
import { RelatosPublicService } from './relatos-public.service';
import { AppError } from '../../../middlewares/error-handler';
import { logger } from '@utils/logger';

export class RelatosPublicController {
  private service: RelatosPublicService;

  constructor() {
    this.service = new RelatosPublicService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.createReport(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { protocol } = req.params;
      const result = await this.service.getReportStatus(protocol);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  createMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { protocol } = req.params;
      const { content } = req.body;
      const result = await this.service.addPublicMessage(protocol, content);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
  uploadAttachments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { protocol } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new AppError('Nenhum arquivo foi enviado', 400);
      }

      const result = await this.service.uploadAttachments(protocol, files);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAttachments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { protocol } = req.params;
      const result = await this.service.getReportAttachments(protocol);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  downloadAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { protocol, attachmentId } = req.params;
      
      const fileInfo = await this.service.downloadAttachment(protocol, attachmentId);
      
      // Configurar headers para download
      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader('Content-Length', fileInfo.size);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileInfo.fileName)}"`);
      
      // Stream do arquivo
      const fs = require('fs');
      const fileStream = fs.createReadStream(fileInfo.filePath);
      
      fileStream.on('error', (error: any) => {
        logger.error({ error, attachmentId }, 'Erro ao fazer stream do arquivo');
        next(new AppError('Erro ao baixar arquivo', 500));
      });
      
      fileStream.pipe(res);
      
    } catch (error) {
      next(error);
    }
  };
}