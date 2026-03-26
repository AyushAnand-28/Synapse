import { Router, RequestHandler } from 'express';
import { studyPlanController } from '../di';
import { validateGeneratePlan } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// All plan routes require auth
router.use(authenticate);

router.post('/generate',            validateGeneratePlan, studyPlanController.generatePlan as RequestHandler);
router.get('/user',                 studyPlanController.getPlansForUser as RequestHandler);
router.get('/:planId/roadmap',      studyPlanController.getRoadmap as RequestHandler);
router.post('/:planId/recalculate', studyPlanController.recalculateSchedule as RequestHandler);

export default router;

