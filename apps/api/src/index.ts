import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectSubmissionRouter from './routes/projectSubmission';
import { generateBio } from './lib/gemini';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/submit-project', projectSubmissionRouter);

app.post('/api/sp/generate-bio', async (req: Request, res: Response) => {
    const { notes } = req.body;
    if (!notes) return res.status(400).json({ error: 'Notes are required' });

    try {
        const bio = await generateBio({ notes });
        res.json({ bio });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate bio' });
    }
});

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', database: 'connected' });
});

// AI Deconstruction Endpoint Placeholder
app.post('/api/deconstruct', async (req: Request, res: Response) => {
    const { description } = req.body;
    // Gemini logic will go here
    res.json({ message: 'Request received', description });
});

app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
});
