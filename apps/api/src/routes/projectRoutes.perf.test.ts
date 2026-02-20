import request from 'supertest';
import express from 'express';
// We need to import prisma to access the mocked functions
import { prisma } from '@quoteme/database';
import projectRouter from './projectRoutes';

// 1. Mock the database
jest.mock('@quoteme/database', () => ({
    prisma: {
        quote: {
            findUnique: jest.fn(),
            updateMany: jest.fn(),
            update: jest.fn(),
        },
        $transaction: jest.fn((promises) => Promise.all(promises))
    }
}));

// Mock logger
jest.mock('../lib/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    }
}));

// Mock AggregateQuotesForProject
jest.mock('../lib/QuoteAggregator', () => ({
    aggregateQuotesForProject: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/projects', projectRouter);

describe('POST /projects/:id/select-quote Performance Check', () => {
    const mockFindUnique = prisma.quote.findUnique as jest.Mock;
    const mockUpdateMany = prisma.quote.updateMany as jest.Mock;
    const mockUpdate = prisma.quote.update as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches quote without unnecessary include (optimized)', async () => {
        const projectId = 'proj-123';
        const quoteId = 'quote-456';
        const trade = 'PLUMBING';

        mockFindUnique.mockResolvedValue({
            id: quoteId,
            requestId: projectId,
            trade: trade
        });

        // Mock update responses
        mockUpdateMany.mockResolvedValue({ count: 1 });
        mockUpdate.mockResolvedValue({ id: quoteId, isSelected: true });

        const res = await request(app)
            .post(`/projects/${projectId}/select-quote`)
            .send({ quoteId });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Quote selected successfully' });

        // Verify the call arguments - optimized check
        expect(mockFindUnique).toHaveBeenCalledWith({
            where: { id: quoteId }
        });

        // Ensure subsequent logic ran (updateMany and update)
        expect(mockUpdateMany).toHaveBeenCalledWith({
             where: {
                requestId: projectId,
                trade: trade,
                id: { not: quoteId }
            },
            data: { isSelected: false }
        });
    });
});
