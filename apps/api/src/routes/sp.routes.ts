import { Router } from 'express';
import { updateProfile, getAvailableProjects, generateBioContent } from '../controllers/sp.controller';
import { authenticateSP } from '../middleware/auth.middleware';

const router = Router();

router.post('/generate-bio', generateBioContent);
router.put('/profile', authenticateSP, updateProfile);
router.get('/available-projects', authenticateSP, getAvailableProjects);

export default router;
