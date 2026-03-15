import { Router } from 'express';
import { graphController } from '../di';

const router = Router();

router.get('/:planId', graphController.getGraph);

export default router;
