import { Router } from 'express';
import { updateProfile } from '../controllers/sp.controller';
import { authenticateSP } from '../middleware/auth.middleware';

const router = Router();

router.put('/profile', authenticateSP, updateProfile);

export default router;
