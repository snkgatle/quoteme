import { notifyServiceProviders } from './notifications';
import { prisma } from '@quoteme/database';
import { sendEmailNotification } from './notificationService';
import { logger } from './logger';

// Mock dependencies
jest.mock('@quoteme/database', () => ({
    prisma: {
        serviceProvider: {
            findMany: jest.fn(),
        },
    },
}));

jest.mock('./notificationService', () => ({
    sendEmailNotification: jest.fn(),
}));

jest.mock('./logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe('notifyServiceProviders', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch providers and send emails', async () => {
        const mockProviders = [
            { id: '1', email: 'sp1@example.com', name: 'SP One' },
            { id: '2', email: 'sp2@example.com', name: 'SP Two' },
        ];

        (prisma.serviceProvider.findMany as jest.Mock).mockResolvedValue(mockProviders);
        (sendEmailNotification as jest.Mock).mockResolvedValue(true);

        const providerIds = ['1', '2'];
        const requestId = 'req-123';

        await notifyServiceProviders(providerIds, requestId);

        expect(prisma.serviceProvider.findMany).toHaveBeenCalledWith({
            where: {
                id: { in: providerIds },
                status: 'ACTIVE',
            },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        expect(sendEmailNotification).toHaveBeenCalledTimes(2);
        expect(sendEmailNotification).toHaveBeenCalledWith({
            to: 'sp1@example.com',
            subject: 'New Project Opportunity',
            body: expect.stringContaining('req-123'),
        });
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Alert sent to provider 1'));
    });

    it('should handle empty provider list gracefully', async () => {
        (prisma.serviceProvider.findMany as jest.Mock).mockResolvedValue([]);

        await notifyServiceProviders(['3'], 'req-456');

        expect(sendEmailNotification).not.toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('No active providers found'));
    });

    it('should log warning when email sending fails', async () => {
         const mockProviders = [
            { id: '1', email: 'sp1@example.com', name: 'SP One' },
        ];
        (prisma.serviceProvider.findMany as jest.Mock).mockResolvedValue(mockProviders);
        (sendEmailNotification as jest.Mock).mockResolvedValue(false);

        await notifyServiceProviders(['1'], 'req-123');

        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Failed to send alert'));
    });

    it('should catch and log errors during execution', async () => {
        (prisma.serviceProvider.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

        await notifyServiceProviders(['1'], 'req-123');

        expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error in notifyServiceProviders'), expect.anything());
    });
});
