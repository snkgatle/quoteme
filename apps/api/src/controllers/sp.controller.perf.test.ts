import { getAvailableProjects } from './sp.controller';
import { Request, Response } from 'express';
import { prisma } from '@quoteme/database';

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

describe('getAvailableProjects Performance', () => {
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

    it('should use optimized database-level filtering', async () => {
        const sp = {
            id: 'sp-123',
            latitude: 40.7128,
            longitude: -74.0060,
            trades: ['Plumber'],
            // quotes are no longer needed in the SP object
        };

        (prisma.serviceProvider.findUnique as jest.Mock).mockResolvedValue(sp);
        (prisma.quoteRequest.findMany as jest.Mock).mockResolvedValue([]);
        (prisma.quote.findMany as jest.Mock).mockResolvedValue([]);

        await getAvailableProjects(mockReq as Request, mockRes as Response);

        // Verify optimized query structure:
        // 1. Should NOT fetch quotes with SP (memory optimization)
        expect(prisma.serviceProvider.findUnique).toHaveBeenCalledWith(expect.not.objectContaining({
            include: { quotes: true }
        }));

        // 2. Should use relationship filter for exclusion (DB optimization)
        expect(prisma.quoteRequest.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                quotes: {
                    none: {
                        serviceProviderId: 'sp-123'
                    }
                }
            })
        }));
    });
});
