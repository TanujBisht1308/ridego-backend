import { Router } from 'express';
import {
  getIncomingRideHandler,
  acceptRideHandler,
  rejectRideHandler,
  reachedPickupHandler,
  startRideHandler,
  completeRideHandler,
  getRideHistoryHandler,
} from '../controllers/ride.controller.js';
import { rideIdValidator } from '../validators/ride.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/incoming', getIncomingRideHandler);
router.post('/accept', rideIdValidator, validate, acceptRideHandler);
router.post('/reject', rideIdValidator, validate, rejectRideHandler);
router.post('/reached-pickup', rideIdValidator, validate, reachedPickupHandler);
router.post('/start', rideIdValidator, validate, startRideHandler);
router.post('/complete', rideIdValidator, validate, completeRideHandler);
router.get('/history', getRideHistoryHandler);

export default router;