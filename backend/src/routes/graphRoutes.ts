import { Router } from 'express';
import { graphController } from '../di';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
router.use(authenticate);
router.get('/:planId', graphController.getGraph);
export default router;
