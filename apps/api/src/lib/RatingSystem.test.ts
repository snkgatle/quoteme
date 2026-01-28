import { updateServiceProviderRating } from './RatingSystem';
import { prisma } from '@quoteme/database';

// Mock the prisma client
jest.mock('@quoteme/database', () => ({
    prisma: {
        serviceProvider: {
            update: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

describe('updateServiceProviderRating', () => {
    const mockUpdate = prisma.serviceProvider.update as jest.Mock;
    const mockFindUnique = prisma.serviceProvider.findUnique as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update rating and NOT deactivate if rating >= 3.0', async () => {
        const providerId = 'provider-1';
        const newRating = 4.5;

        // Mock findUnique (Current State)
        mockFindUnique.mockResolvedValue({
            id: providerId,
            rating: 5.0,
            reviewCount: 5,
            status: 'ACTIVE',
        });

        const mockProvider = {
            id: providerId,
            rating: newRating,
            reviewCount: 5,
            status: 'ACTIVE',
        };

        mockUpdate.mockResolvedValue(mockProvider);

        const result = await updateServiceProviderRating(providerId, newRating);

        expect(mockFindUnique).toHaveBeenCalledTimes(1);
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: providerId },
            data: { rating: newRating },
        });
        expect(result.status).toBe('ACTIVE');
    });

    it('should update rating and deactivate if rating < 3.0 and reviewCount >= 3', async () => {
        const providerId = 'provider-2';
        const newRating = 2.5;

        // Mock findUnique return (Current State)
        mockFindUnique.mockResolvedValue({
            id: providerId,
            rating: 3.5,
            reviewCount: 5,
            status: 'ACTIVE',
        });

        // Mock update return (Final State)
        const finalProvider = {
            id: providerId,
            rating: newRating,
            reviewCount: 5,
            status: 'DEACTIVATED',
        };
        mockUpdate.mockResolvedValue(finalProvider);

        const result = await updateServiceProviderRating(providerId, newRating);

        // Expect 1 update now (Optimization)
        expect(mockUpdate).toHaveBeenCalledTimes(1);

        // The single update should contain both rating and status change
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: providerId },
            data: {
                rating: newRating,
                status: 'DEACTIVATED'
            },
        });

        expect(result.status).toBe('DEACTIVATED');
    });

    it('should update rating and PREVENT deactivation if rating < 3.0 but reviewCount < 3', async () => {
        const providerId = 'provider-3';
        const newRating = 2.5;

        // Mock findUnique (Current State)
        mockFindUnique.mockResolvedValue({
            id: providerId,
            rating: 3.5,
            reviewCount: 2, // Less than 3
            status: 'ACTIVE',
        });

        const mockProvider = {
            id: providerId,
            rating: newRating,
            reviewCount: 2,
            status: 'ACTIVE',
        };

        mockUpdate.mockResolvedValue(mockProvider);

        const result = await updateServiceProviderRating(providerId, newRating);

        expect(mockFindUnique).toHaveBeenCalledTimes(1);
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(result.status).toBe('ACTIVE');
    });
});
