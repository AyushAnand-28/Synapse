import { Router } from 'express';
import { studyPlanController } from '../di';

const router = Router();

router.post('/generate', studyPlanController.generatePlan);

export default router;
