import { Router } from 'express';
import {
  getProfileHandler,
  setupProfileHandler,
  submitDocumentsHandler,
  toggleStatusHandler,
  getDashboardStatsHandler,
} from '../controllers/driver.controller.js';
import { setupProfileValidator } from '../validators/driver.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfileHandler);
router.post('/profile/setup', setupProfileValidator, validate, setupProfileHandler);
router.post('/documents/submit', submitDocumentsHandler);

// Phase 6
router.patch('/status', toggleStatusHandler);
router.get('/dashboard/stats', getDashboardStatsHandler);
import { registerFcmTokenHandler } from '../controllers/driver.controller.js';

router.post('/fcm-token', registerFcmTokenHandler);
export default router;
