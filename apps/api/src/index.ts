import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from '@quoteme/database';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', database: 'connected' });
});

// AI Deconstruction Endpoint Placeholder
app.post('/api/deconstruct', async (req, res) => {
    const { description } = req.body;
    // Gemini logic will go here
    res.json({ message: 'Request received', description });
});

app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
});
