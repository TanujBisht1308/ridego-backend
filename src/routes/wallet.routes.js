import { Router } from 'express';
import { getWalletHandler, addMoneyHandler, payForRideHandler } from '../controllers/wallet.controller.js';
import { addMoneyValidator, payForRideValidator } from '../validators/wallet.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticateCustomer } from '../middleware/customerAuth.middleware.js';

const router = Router();

router.use(authenticateCustomer);

router.get('/', getWalletHandler);
router.post('/add-money', addMoneyValidator, validate, addMoneyHandler);
router.post('/pay', payForRideValidator, validate, payForRideHandler);

export default router;