import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notifications.controller';
import { authenticateSP } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateSP);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

export default router;
