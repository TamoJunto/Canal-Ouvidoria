import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '@middlewares/error-handler';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return next(new AppError(
          'Erro de validação',
          400,
          'VALIDATION_ERROR',
          { errors: messages }
        ));
      }
      
      next(error);
    }
  };
};