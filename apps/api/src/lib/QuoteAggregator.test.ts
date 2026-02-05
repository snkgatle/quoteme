import { aggregateQuotesForProject } from './QuoteAggregator';
import { prisma } from '@quoteme/database';

// Mock the prisma client
jest.mock('@quoteme/database', () => ({
    prisma: {
        quoteRequest: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        notification: {
            createMany: jest.fn(),
        },
    },
}));

jest.mock('./gemini', () => ({
    generateCombinedSummary: jest.fn().mockResolvedValue('Mock Summary'),
}));

jest.mock('./logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
    },
}));

describe('aggregateQuotesForProject', () => {
    const mockFindUnique = prisma.quoteRequest.findUnique as jest.Mock;
    const mockUpdate = prisma.quoteRequest.update as jest.Mock;
    const mockCreateMany = prisma.notification.createMany as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should aggregate quotes and batch create notifications for selected providers', async () => {
        const projectId = 'project-1';

        const mockProject = {
            id: projectId,
            requiredTrades: ['Plumbing', 'Electrical'],
            isCombinedSent: false,
            status: 'PENDING',
            createdAt: new Date(),
            description: 'Fix stuff',
            user: {
                name: 'John Doe',
                phone: '555-0100',
                email: 'john@example.com'
            },
            quotes: [
                {
                    serviceProviderId: 'sp1',
                    trade: 'Plumbing',
                    amount: 100,
                    isSelected: true,
                    serviceProvider: { status: 'ACTIVE', name: 'SP1', id: 'sp1' }
                },
                {
                    serviceProviderId: 'sp2',
                    trade: 'Electrical',
                    amount: 200,
                    isSelected: true,
                    serviceProvider: { status: 'ACTIVE', name: 'SP2', id: 'sp2' }
                },
                {
                    serviceProviderId: 'sp3',
                    trade: 'Plumbing',
                    amount: 300,
                    isSelected: false, // Not selected
                    serviceProvider: { status: 'ACTIVE', name: 'SP3', id: 'sp3' }
                }
            ]
        };

        mockFindUnique.mockResolvedValue(mockProject);

        const result = await aggregateQuotesForProject(projectId);

        expect(mockFindUnique).toHaveBeenCalledWith({
            where: { id: projectId },
            include: {
                user: true,
                quotes: {
                    include: {
                        serviceProvider: true
                    }
                }
            }
        });

        // Verify update was called
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: projectId },
            data: {
                isCombinedSent: true,
                status: 'COMBINED_SENT'
            }
        });

        // Verify batch notification creation (The core optimization test)
        expect(mockCreateMany).toHaveBeenCalledTimes(1);
        expect(mockCreateMany).toHaveBeenCalledWith({
            data: expect.arrayContaining([
                {
                    serviceProviderId: 'sp1',
                    type: 'QUOTE_ACCEPTED',
                    message: expect.stringContaining('John Doe (555-0100, john@example.com)'),
                    projectId: projectId
                },
                {
                    serviceProviderId: 'sp2',
                    type: 'QUOTE_ACCEPTED',
                    message: expect.stringContaining('John Doe (555-0100, john@example.com)'),
                    projectId: projectId
                }
            ]),
            skipDuplicates: true
        });

        expect(result.status).toBe('COMPLETE');
        expect(result.totalCost).toBe(300);
    });

    it('should not send notifications if isCombinedSent is already true', async () => {
        const projectId = 'project-already-sent';
        const mockProject = {
            id: projectId,
            requiredTrades: ['Plumbing'],
            isCombinedSent: true, // Already sent
            status: 'COMBINED_SENT',
            createdAt: new Date(),
            description: 'Fix stuff',
            user: { name: 'John', phone: '123', email: 'j@e.com' },
            quotes: [
                {
                    serviceProviderId: 'sp1',
                    trade: 'Plumbing',
                    amount: 100,
                    isSelected: true,
                    serviceProvider: { status: 'ACTIVE', name: 'SP1', id: 'sp1' }
                }
            ]
        };

        mockFindUnique.mockResolvedValue(mockProject);

        await aggregateQuotesForProject(projectId);

        expect(mockUpdate).not.toHaveBeenCalled();
        expect(mockCreateMany).not.toHaveBeenCalled();
    });
});
