import { prisma } from '@quoteme/database';

export async function updateServiceProviderRating(providerId: string, newRating: number) {
    // Update the provider's rating
    const provider = await prisma.serviceProvider.update({
        where: { id: providerId },
        data: { rating: newRating }
    });

    // Auto-deactivation logic: If rating drops below 3.0, set status to DEACTIVATED
    if (provider.rating < 3.0 && provider.status !== 'DEACTIVATED') {
        console.log(`[Audit] Auto-deactivating Service Provider ${providerId} due to low rating: ${provider.rating}`);
        await prisma.serviceProvider.update({
            where: { id: providerId },
            data: { status: 'DEACTIVATED' }
        });
        return { ...provider, status: 'DEACTIVATED' };
    }

    return provider;
}
