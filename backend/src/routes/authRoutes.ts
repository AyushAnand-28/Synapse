import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const auth = new AuthController();

router.post('/register', auth.register);
router.post('/login',    auth.login);
router.get('/me',        authenticate, auth.me);

export default router;
