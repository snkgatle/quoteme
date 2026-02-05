import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectSubmissionRouter from './routes/projectSubmission';
import projectRouter from './routes/projectRoutes';
import authRouter from './routes/auth.routes';
import spRouter from './routes/sp.routes';
import notificationRouter from './routes/notifications.routes';
import quoteRouter from './routes/quote.routes';
import { deconstructProject } from './lib/gemini';

import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const app = express();
const port = process.env.PORT || 3300;

app.use(cors());
app.use(express.json());

app.use('/api/submit-project', projectSubmissionRouter);
app.use('/api/projects', projectRouter);
app.use('/api/auth', authRouter);
app.use('/api/sp', spRouter);
app.use('/api/sp/notifications', notificationRouter);
app.use('/api/quotes', quoteRouter);

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', database: 'connected' });
});

// AI Deconstruction Endpoint Placeholder
app.post('/api/deconstruct', async (req: Request, res: Response) => {
    try {
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }

        const deconstructed = await deconstructProject(description);
        res.json({ deconstructed });
    } catch (error) {
        console.error('Error deconstructing project:', error);
        res.status(500).json({ error: 'Failed to deconstruct project' });
    }
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`API server running at http://localhost:${port}`);
    });
}
