import { Router } from 'express';
import { adminLoginHandler, getLogsHandler, getDashboardHandler } from '../controllers/admin.controller.js';
import { authenticateAdmin } from '../middleware/adminAuth.middleware.js';

const router = Router();

router.post('/login', adminLoginHandler);
router.get('/dashboard', authenticateAdmin, getDashboardHandler);
router.get('/logs', authenticateAdmin, getLogsHandler);

export default router;
import {
  getDriversHandler,
  getDriverDetailHandler,
  verifyDriverHandler,
  suspendDriverHandler,
} from '../controllers/admin.controller.js';

router.get('/drivers', authenticateAdmin, getDriversHandler);
router.get('/drivers/:id', authenticateAdmin, getDriverDetailHandler);
router.put('/drivers/:id/verify', authenticateAdmin, verifyDriverHandler);
router.put('/drivers/:id/suspend', authenticateAdmin, suspendDriverHandler);