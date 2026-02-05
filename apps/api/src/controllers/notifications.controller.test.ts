import { getNotifications } from './notifications.controller';
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

describe('getNotifications N+1 Benchmark', () => {
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

    it('should use createMany to optimize notification generation', async () => {
        // Mock SP
        (prisma.serviceProvider.findUnique as jest.Mock).mockResolvedValue({
            id: 'sp-123',
            latitude: 40.7128,
            longitude: -74.0060,
            trades: ['Plumber'],
            quotes: [],
        });

        // Mock 3 projects that match
        const projects = [
            { id: 'p1', requiredTrades: ['Plumber'], latitude: 40.7128, longitude: -74.0060, status: 'PENDING', createdAt: new Date() },
            { id: 'p2', requiredTrades: ['Plumber'], latitude: 40.7128, longitude: -74.0060, status: 'PENDING', createdAt: new Date() },
            { id: 'p3', requiredTrades: ['Plumber'], latitude: 40.7128, longitude: -74.0060, status: 'PENDING', createdAt: new Date() },
        ];
        (prisma.quoteRequest.findMany as jest.Mock).mockResolvedValue(projects);

        // Mock notification logic
        (prisma.notification.createMany as jest.Mock).mockResolvedValue({ count: 3 });
        (prisma.notification.findMany as jest.Mock).mockResolvedValue([]);

        await getNotifications(mockReq as Request, mockRes as Response);

        // Optimized Verification:
        // findFirst should NOT be called (loop removed)
        // create should NOT be called
        // createMany should be called ONCE

        expect(prisma.notification.findFirst).not.toHaveBeenCalled();
        expect(prisma.notification.create).not.toHaveBeenCalled();
        expect(prisma.notification.createMany).toHaveBeenCalledTimes(1);
        expect(prisma.notification.createMany).toHaveBeenCalledWith({
            data: expect.arrayContaining([
                expect.objectContaining({ projectId: 'p1', serviceProviderId: 'sp-123', type: 'CLOSING_SOON' }),
                expect.objectContaining({ projectId: 'p2', serviceProviderId: 'sp-123', type: 'CLOSING_SOON' }),
                expect.objectContaining({ projectId: 'p3', serviceProviderId: 'sp-123', type: 'CLOSING_SOON' }),
            ]),
            skipDuplicates: true
        });
    });
});
