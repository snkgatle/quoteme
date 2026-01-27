import { prisma } from '@quoteme/database';

export async function updateServiceProviderRating(providerId: string, newRating: number, newReviewCount?: number) {
    const data: any = { rating: newRating };
    if (newReviewCount !== undefined) {
        data.reviewCount = newReviewCount;
    }

    // Update the provider's rating
    const provider = await prisma.serviceProvider.update({
        where: { id: providerId },
        data
    });

    // Auto-deactivation logic: If rating drops below 3.0, set status to DEACTIVATED
    // Prevent rating shock: Only deactivate if SP has at least 3 reviews
    if (provider.rating < 3.0 && provider.reviewCount >= 3 && provider.status !== 'DEACTIVATED') {
        console.log(`[Audit] Auto-deactivating Service Provider ${providerId} due to low rating: ${provider.rating}`);
        await prisma.serviceProvider.update({
            where: { id: providerId },
            data: { status: 'DEACTIVATED' }
        });
        return { ...provider, status: 'DEACTIVATED' };
    }

    return provider;
}
