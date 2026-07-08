import { Router } from 'express';
import {
  getSettingsHandler,
  updateSettingsHandler,
} from '../controllers/settings.controller.js';
import { updateSettingsValidator } from '../validators/settings.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getSettingsHandler);
router.put('/', updateSettingsValidator, validate, updateSettingsHandler);

export default router;