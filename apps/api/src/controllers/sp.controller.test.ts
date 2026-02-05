import { getAvailableProjects } from './sp.controller';
import { Request, Response } from 'express';
import { prisma } from '@quoteme/database';
import { TRADES } from '../lib/constants';

// Mock prisma
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

// Mock logger
jest.mock('../lib/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe('getAvailableProjects', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        mockRes = {
            status: statusMock,
            json: jsonMock,
        } as any;
        mockReq = {
            user: { id: 'sp-123' },
        } as any;
        jest.clearAllMocks();
    });

    const generateRequests = (count: number) => {
        const requests = [];
        for (let i = 0; i < count; i++) {
            requests.push({
                id: `req-${i}`,
                status: 'PENDING',
                latitude: 40.7128 + (Math.random() * 0.01), // Nearby
                longitude: -74.0060 + (Math.random() * 0.01),
                requiredTrades: [TRADES[Math.floor(Math.random() * TRADES.length)]],
                user: {
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: '1234567890'
                }
            });
        }
        return requests;
    };

    it('should query Prisma with trade and location filters', async () => {
        const sp = {
            id: 'sp-123',
            latitude: 40.7128,
            longitude: -74.0060,
            trades: ['Plumber', 'Electrician'],
            quotes: [] // No quotes yet
        };

        (prisma.serviceProvider.findUnique as jest.Mock).mockResolvedValue(sp);

        const filteredRequests = generateRequests(5);
        (prisma.quoteRequest.findMany as jest.Mock).mockResolvedValue(filteredRequests);
        (prisma.quote.findMany as jest.Mock).mockResolvedValue([]);

        await getAvailableProjects(mockReq as Request, mockRes as Response);

        // Verify Prisma was called with optimization filters
        expect(prisma.quoteRequest.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                requiredTrades: {
                    hasSome: sp.trades
                },
                latitude: expect.objectContaining({
                    gte: expect.any(Number),
                    lte: expect.any(Number)
                }),
                longitude: expect.objectContaining({
                    gte: expect.any(Number),
                    lte: expect.any(Number)
                })
            })
        }));

        expect(statusMock).not.toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalled();
        const response = jsonMock.mock.calls[0][0];
        expect(response.newRequests).toHaveLength(5);
    });
});
