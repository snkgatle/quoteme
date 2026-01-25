import { Router } from 'express';
import { loginOrRegister, getMe } from '../controllers/auth.controller';
import { authenticateSP } from '../middleware/auth.middleware';

const router = Router();

router.post('/sp/login', loginOrRegister);
router.get('/sp/me', authenticateSP, getMe);

export default router;
