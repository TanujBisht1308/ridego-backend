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
import {
  getSavedPlacesHandler,
  createSavedPlaceHandler,
  updateSavedPlaceHandler,
  deleteSavedPlaceHandler,
} from '../controllers/customerProfile.controller.js';

router.get('/saved-places', getSavedPlacesHandler);
router.post('/saved-places', createSavedPlaceHandler);
router.put('/saved-places/:id', updateSavedPlaceHandler);
router.delete('/saved-places/:id', deleteSavedPlaceHandler);