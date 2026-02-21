import { getNotifications } from './notifications.controller';
import { Request, Response } from 'express';
import { prisma } from '@quoteme/database';
import { getBoundsOfDistance } from '../lib/geo';

// Mock prisma
jest.mock('@quoteme/database', () => ({
    prisma: {
        serviceProvider: {
            findUnique: jest.fn(),
        },
        quoteRequest: {
            findMany: jest.fn(),
        },
        notification: {
            findFirst: jest.fn(),
            create: jest.fn(),
            createMany: jest.fn(),
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

// Mock geo
jest.mock('../lib/geo', () => ({
    calculateDistance: jest.fn().mockReturnValue(10), // Always close enough
    getBoundsOfDistance: jest.fn().mockReturnValue({
        minLat: 40,
        maxLat: 41,
        minLon: -75,
        maxLon: -73,
    }),
}));

describe('getNotifications Performance Optimization', () => {
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

    it('should use database filtering for trades, distance, and existing quotes', async () => {
        // Mock SP
        (prisma.serviceProvider.findUnique as jest.Mock).mockResolvedValue({
            id: 'sp-123',
            latitude: 40.7128,
            longitude: -74.0060,
            trades: ['Plumber'],
            quotes: [],
        });

        // Mock findMany result (empty for now is fine, we care about the query args)
        (prisma.quoteRequest.findMany as jest.Mock).mockResolvedValue([]);
        (prisma.notification.findMany as jest.Mock).mockResolvedValue([]);

        await getNotifications(mockReq as Request, mockRes as Response);

        // Verify query structure
        expect(prisma.quoteRequest.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                status: 'PENDING',
                // Date range is dynamic, so we might skip exact match or use expect.any(Date)
                createdAt: expect.objectContaining({
                    gte: expect.any(Date),
                    lt: expect.any(Date)
                }),
                // Optimized filters
                requiredTrades: { hasSome: ['Plumber'] },
                quotes: { none: { serviceProviderId: 'sp-123' } },
                latitude: { gte: 40, lte: 41 },
                longitude: { gte: -75, lte: -73 }
            })
        }));
    });

    it('should skip project search if service provider location is missing (zero)', async () => {
        // Mock SP with missing/zero location
        (prisma.serviceProvider.findUnique as jest.Mock).mockResolvedValue({
            id: 'sp-123',
            latitude: 0,
            longitude: 0,
            trades: ['Plumber'],
            quotes: [],
        });

        // Mock findMany for notifications (should still be called)
        (prisma.notification.findMany as jest.Mock).mockResolvedValue([]);

        await getNotifications(mockReq as Request, mockRes as Response);

        // findMany for projects should NOT be called
        expect(prisma.quoteRequest.findMany).not.toHaveBeenCalled();

        // notifications should still be fetched
        expect(prisma.notification.findMany).toHaveBeenCalled();
    });
});
