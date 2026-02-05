import { getAvailableProjects } from './sp.controller';
import { prisma } from '@quoteme/database';
import { Request, Response } from 'express';

// Mock the prisma client
jest.mock('@quoteme/database', () => ({
    prisma: {
        serviceProvider: {
            findUnique: jest.fn(),
        },
        quoteRequest: {
            findMany: jest.fn(),
        },
        quote: {
            findMany: jest.fn(),
        },
    },
}));

describe('getAvailableProjects', () => {
    const mockFindUniqueSP = prisma.serviceProvider.findUnique as jest.Mock;
    const mockFindManyRequests = prisma.quoteRequest.findMany as jest.Mock;
    const mockFindManyQuotes = prisma.quote.findMany as jest.Mock;

    let mockReq: Request;
    let mockRes: Response;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            user: { id: 'sp-123' },
            query: {},
        } as unknown as Request;

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;
    });

    it('should fetch EVERYTHING when no view param is provided (baseline)', async () => {
        // Mock SP setup
        mockFindUniqueSP.mockResolvedValue({
            id: 'sp-123',
            latitude: 40.7128,
            longitude: -74.0060,
            trades: ['PLUMBING'],
            quotes: [{ requestId: 'req-1' }], // One existing quote
        });

        // Mock requests
        mockFindManyRequests.mockResolvedValue([
            { id: 'req-2', latitude: 40.7129, longitude: -74.0061, requiredTrades: ['PLUMBING'], user: { name: 'User' } }
        ]);

        // Mock quotes
        mockFindManyQuotes.mockResolvedValue([
            {
                id: 'quote-1',
                status: 'PENDING',
                requestId: 'req-1',
                request: {
                    id: 'req-1',
                    status: 'PENDING',
                    user: { name: 'User' }
                }
            }
        ]);

        await getAvailableProjects(mockReq, mockRes);

        expect(mockFindUniqueSP).toHaveBeenCalled();
        expect(mockFindManyRequests).toHaveBeenCalled();
        expect(mockFindManyQuotes).toHaveBeenCalled();

        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            newRequests: expect.any(Array),
            sentQuotes: expect.any(Array),
            acceptedJobs: expect.any(Array),
        }));
    });

    it('should fetch ONLY requests when view=requests', async () => {
        mockReq.query = { view: 'requests' };

        // Mock SP setup
        mockFindUniqueSP.mockResolvedValue({
            id: 'sp-123',
            latitude: 40.7128,
            longitude: -74.0060,
            trades: ['PLUMBING'],
            quotes: [{ requestId: 'req-1' }],
        });

        // Mock requests
        mockFindManyRequests.mockResolvedValue([]);

        await getAvailableProjects(mockReq, mockRes);

        expect(mockFindUniqueSP).toHaveBeenCalled();
        expect(mockFindManyRequests).toHaveBeenCalled();
        expect(mockFindManyQuotes).not.toHaveBeenCalled(); // Optimization verified!
    });

    it('should fetch ONLY quotes when view=quotes', async () => {
        mockReq.query = { view: 'quotes' };

        // Mock SP setup
        mockFindUniqueSP.mockResolvedValue({
            id: 'sp-123',
            quotes: [],
        });

        // Mock quotes
        mockFindManyQuotes.mockResolvedValue([]);

        await getAvailableProjects(mockReq, mockRes);

        expect(mockFindUniqueSP).toHaveBeenCalled();
        expect(mockFindManyRequests).not.toHaveBeenCalled(); // Optimization verified!
        expect(mockFindManyQuotes).toHaveBeenCalledWith(expect.objectContaining({
            where: { serviceProviderId: 'sp-123' }
        }));
    });

    it('should fetch ONLY accepted quotes when view=accepted', async () => {
        mockReq.query = { view: 'accepted' };

        // Mock SP setup
        mockFindUniqueSP.mockResolvedValue({
            id: 'sp-123',
            quotes: [],
        });

        // Mock quotes
        mockFindManyQuotes.mockResolvedValue([]);

        await getAvailableProjects(mockReq, mockRes);

        expect(mockFindUniqueSP).toHaveBeenCalled();
        expect(mockFindManyRequests).not.toHaveBeenCalled();
        expect(mockFindManyQuotes).toHaveBeenCalledWith(expect.objectContaining({
            where: { serviceProviderId: 'sp-123', status: 'ACCEPTED' } // Filter verified!
        }));
    });
});
