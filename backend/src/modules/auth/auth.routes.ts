import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateToken, optionalAuth } from '@middlewares/auth.middleware';
import {
  magicLinkEmailRateLimiter,
  magicLinkIpRateLimiter,
} from '@middlewares/rate-limit.middleware';
import { asyncHandler } from '@middlewares/error-handler';

const router = Router();
const controller = new AuthController();

/**
 * @route POST /auth/magic-link
 * @desc Solicita um magic link para autenticação
 * @access Public
 */
router.post(
  '/magic-link',
  // Temporariamente desabilitado para desenvolvimento
  // magicLinkEmailRateLimiter,
  // magicLinkIpRateLimiter,
  asyncHandler(controller.requestMagicLink)
);

/**
 * @route GET /auth/verify-magic-link
 * @desc Verifica um magic link e retorna tokens JWT
 * @access Public
 */
router.get(
  '/verify-magic-link',
  asyncHandler(controller.verifyMagicLink)
);

/**
 * @route POST /auth/refresh
 * @desc Renova tokens usando refresh token
 * @access Public
 */
router.post(
  '/refresh',
  asyncHandler(controller.refreshToken)
);

/**
 * @route POST /auth/logout
 * @desc Faz logout revogando tokens
 * @access Public/Protected
 */
router.post(
  '/logout',
  optionalAuth,
  asyncHandler(controller.logout)
);

/**
 * @route GET /auth/me
 * @desc Retorna informações do usuário autenticado
 * @access Protected
 */
router.get(
  '/me',
  authenticateToken,
  asyncHandler(controller.me)
);

/**
 * @route GET /auth/health
 * @desc Health check do serviço de autenticação
 * @access Public
 */
router.get(
  '/health',
  asyncHandler(controller.health)
);

export default router;



