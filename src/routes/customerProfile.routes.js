import { Router } from 'express';
import { getProfileHandler, updateProfileHandler } from '../controllers/customerProfile.controller.js';
import { updateProfileValidator } from '../validators/customerAuth.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticateCustomer } from '../middleware/customerAuth.middleware.js';

const router = Router();

router.use(authenticateCustomer);

router.get('/profile', getProfileHandler);
router.put('/profile', updateProfileValidator, validate, updateProfileHandler);
import { registerFcmTokenHandler } from '../controllers/customerProfile.controller.js';

router.post('/fcm-token', registerFcmTokenHandler);
export default router;
