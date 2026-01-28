import { prisma } from '@quoteme/database';

export async function updateServiceProviderRating(providerId: string, newRating: number, newReviewCount?: number) {
    // Optimization: Fetch current state first to determine final status and perform a single update
    const currentProvider = await prisma.serviceProvider.findUnique({
        where: { id: providerId },
        select: { status: true, reviewCount: true }
    });

    // Prisma update throws if not found, so we should too (or let the next update throw, but we need data)
    if (!currentProvider) {
        // If we can't find it, we can't calculate logic.
        // Attempting to update to let Prisma throw the standard error
        return prisma.serviceProvider.update({
            where: { id: providerId },
            data: { rating: newRating } // This will fail
        });
    }

    const effectiveReviewCount = newReviewCount !== undefined ? newReviewCount : currentProvider.reviewCount;
    let newStatus = currentProvider.status;

    // Auto-deactivation logic: If rating drops below 3.0, set status to DEACTIVATED
    // Prevent rating shock: Only deactivate if SP has at least 3 reviews
    if (newRating < 3.0 && currentProvider.status !== 'DEACTIVATED') {
        if (effectiveReviewCount >= 3) {
            console.log(`[Audit] Auto-deactivating Service Provider ${providerId} due to low rating: ${newRating}`);
            newStatus = 'DEACTIVATED';
        } else {
            console.log(`[Audit] Prevented deactivation for SP ${providerId} (Rating: ${newRating}) due to insufficient reviews (${effectiveReviewCount} < 3).`);
        }
    }

    const data: any = { rating: newRating };
    if (newReviewCount !== undefined) {
        data.reviewCount = newReviewCount;
    }
    if (newStatus !== currentProvider.status) {
        data.status = newStatus;
    }

    // Update the provider in a single call
    const provider = await prisma.serviceProvider.update({
        where: { id: providerId },
        data
    });

    return provider;
}
