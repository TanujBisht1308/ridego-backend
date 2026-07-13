import { Router } from 'express';
import {
  estimateHandler,
  requestRideHandler,
  activeRideHandler,
  rideStatusHandler,
  cancelRideHandler,
  rateRideHandler,
  rideHistoryHandler,
} from '../controllers/customerRide.controller.js';
import { requestRideValidator, rateRideValidator } from '../validators/customerRide.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticateCustomer } from '../middleware/customerAuth.middleware.js';

const router = Router();

router.use(authenticateCustomer);

router.post('/estimate', estimateHandler);
router.post('/', requestRideValidator, validate, requestRideHandler);
router.get('/active', activeRideHandler);
router.get('/history', rideHistoryHandler);
router.get('/:rideId', rideStatusHandler);
router.post('/:rideId/cancel', cancelRideHandler);
router.post('/:rideId/rate', rateRideValidator, validate, rateRideHandler);

export default router;