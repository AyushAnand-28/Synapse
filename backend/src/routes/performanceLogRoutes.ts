import { Router } from 'express';
import { performanceLogController } from '../di';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
router.use(authenticate);

router.post('/',             performanceLogController.logPerformance);
router.get('/summary/:planId', performanceLogController.getSummary);

export default router;

