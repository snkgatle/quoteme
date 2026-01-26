import { Router } from 'express';
import { updateProfile, getAvailableProjects } from '../controllers/sp.controller';
import { authenticateSP } from '../middleware/auth.middleware';

const router = Router();

router.put('/profile', authenticateSP, updateProfile);
router.get('/available-projects', authenticateSP, getAvailableProjects);

export default router;
