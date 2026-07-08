import { Router } from 'express';
import { autocompleteHandler, placeDetailsHandler, reverseGeocodeHandler, routeHandler } from '../controllers/places.controller.js';
import { authenticateCustomer } from '../middleware/customerAuth.middleware.js';

const router = Router();

router.use(authenticateCustomer);

router.get('/autocomplete', autocompleteHandler);
router.get('/details', placeDetailsHandler);
router.get('/reverse-geocode', reverseGeocodeHandler);
router.get('/route', routeHandler);
export default router;