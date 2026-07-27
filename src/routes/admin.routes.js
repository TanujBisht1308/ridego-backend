import { Router } from 'express';
import { adminLoginHandler, getLogsHandler, getDashboardHandler } from '../controllers/admin.controller.js';
import { authenticateAdmin } from '../middleware/adminAuth.middleware.js';

const router = Router();

router.post('/login', adminLoginHandler);
router.get('/dashboard', authenticateAdmin, getDashboardHandler);
router.get('/logs', authenticateAdmin, getLogsHandler);

export default router;