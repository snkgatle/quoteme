import { Router } from 'express';
import multer from 'multer';
import { updateProfile, getAvailableProjects } from '../controllers/sp.controller';
import { authenticateSP } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and JPG are allowed.'));
        }
    }
});

router.put('/profile', authenticateSP, upload.single('certification'), updateProfile);
router.get('/available-projects', authenticateSP, getAvailableProjects);

export default router;
