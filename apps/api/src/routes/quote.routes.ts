import express from 'express';
import { submitQuote } from '../controllers/quote.controller';
import { authenticateSP } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/submit', authenticateSP, submitQuote);

export default router;
