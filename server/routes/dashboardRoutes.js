import { Router } from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard/stats', authenticate, requirePermission('dashboard'), dashboardController.getStats);

export default router;
