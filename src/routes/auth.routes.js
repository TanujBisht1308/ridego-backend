import { Router } from 'express';
import {
  sendOtpHandler,
  verifyOtpHandler,
  refreshTokenHandler,
  logoutHandler,
} from '../controllers/auth.controller.js';
import {
  sendOtpValidator,
  verifyOtpValidator,
  refreshTokenValidator,
} from '../validators/auth.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { otpLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/send-otp', otpLimiter, sendOtpValidator, validate, sendOtpHandler);
router.post('/verify-otp', verifyOtpValidator, validate, verifyOtpHandler);
router.post('/refresh-token', refreshTokenValidator, validate, refreshTokenHandler);
router.post('/logout', logoutHandler);

export default router;