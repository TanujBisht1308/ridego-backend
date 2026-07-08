import { Router } from 'express';
import {
  getEarningsHandler,
  getTransactionsHandler,
} from '../controllers/earnings.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getEarningsHandler);
router.get('/transactions', getTransactionsHandler);

export default router;