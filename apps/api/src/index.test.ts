import request from 'supertest';
import { app } from './index';

// Mock database to avoid connection attempts
jest.mock('@quoteme/database', () => ({
    prisma: {
        quoteRequest: {
            findUnique: jest.fn(),
        },
        quote: {
            findUnique: jest.fn(),
            updateMany: jest.fn(),
            update: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));

// Mock gemini library
jest.mock('./lib/gemini', () => ({
    deconstructProject: jest.fn(),
}));

import { deconstructProject } from './lib/gemini';

describe('POST /api/deconstruct', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should deconstruct project description', async () => {
        const mockDescription = 'Build a house';
        const mockResponse = 'Deconstructed: Build a house';
        (deconstructProject as jest.Mock).mockResolvedValue(mockResponse);

        const res = await request(app)
            .post('/api/deconstruct')
            .send({ description: mockDescription });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ deconstructed: mockResponse });
        expect(deconstructProject).toHaveBeenCalledWith(mockDescription);
    });

    it('should return 400 if description is missing', async () => {
        const res = await request(app)
            .post('/api/deconstruct')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Description is required' });
    });

    it('should return 500 if deconstruction fails', async () => {
        (deconstructProject as jest.Mock).mockRejectedValue(new Error('Gemini error'));

        const res = await request(app)
            .post('/api/deconstruct')
            .send({ description: 'fail' });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Failed to deconstruct project' });
    });
});
