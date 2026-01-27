import { prisma } from '@quoteme/database';
import { generateCombinedSummary } from './gemini';
import { logger } from './logger';

export async function aggregateQuotesForProject(projectId: string) {
    logger.info('Starting quote aggregation', { projectId });

    // 1. Fetch project with its quotes and service providers
    const project = await prisma.quoteRequest.findUnique({
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

    if (!project) {
        logger.warn('Quote aggregation project not found', { projectId });
        throw new Error('Project not found');
    }

    // 2. Check if all required trades have at least one quote
    // Note: In this logic, we assume that 'RequiredServices' means 
    // having at least one quote for each trade in requiredTrades.
    const providedTrades = project.quotes.map((q: any) => q.trade).filter(Boolean) as string[];
    const isComplete = project.requiredTrades.every((trade: string) => providedTrades.includes(trade));

    if (!isComplete) {
        // TTL Logic: Check if 48 hours have passed
        const createdDate = new Date(project.createdAt);
        const now = new Date();
        const diffHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

        if (diffHours < 48) {
            const missingTrades = project.requiredTrades.filter((trade: string) => !providedTrades.includes(trade));
            logger.info('Quote aggregation incomplete (within TTL)', { projectId, missingTrades });
            return {
                status: 'INCOMPLETE',
                missingTrades
            };
        }
        logger.info('Quote aggregation incomplete (TTL expired), proceeding with partial', { projectId });
        // If > 48h, proceed to generate Partial Combined Quote
    }

    // 3. Aggregate total cost using only selected quotes
    const selectedQuotes = project.quotes.filter((q: any) => q.isSelected);

    // Validate: Ensure all selected SPs are ACTIVE
    const inactiveProviders = selectedQuotes.filter((q: any) => q.serviceProvider.status !== 'ACTIVE');
    if (inactiveProviders.length > 0) {
        const names = inactiveProviders.map((q: any) => q.serviceProvider.name).join(', ');
        logger.warn('Quote aggregation failed due to inactive providers', { projectId, inactiveProviders: names });
        throw new Error(`Cannot finalize quote: The following providers are no longer active: ${names}`);
    }

    const totalCost = selectedQuotes.reduce((sum: number, q: any) => sum + q.amount, 0);

    // 4. Generate professional summary via Gemini
    const summary = await generateCombinedSummary(project.description, selectedQuotes);

    // 5. Update database and return combined object
    if (!project.isCombinedSent) {
        await prisma.quoteRequest.update({
            where: { id: projectId },
            data: {
                isCombinedSent: true,
                status: 'COMBINED_SENT'
            }
        });

        // Trigger Notifications for Selected Service Providers
        for (const quote of selectedQuotes) {
            const userContact = project.user ? `${project.user.name} (${project.user.phone}, ${project.user.email})` : 'Contact info unavailable';

            try {
                await prisma.notification.create({
                    data: {
                        serviceProviderId: quote.serviceProviderId,
                        type: 'QUOTE_ACCEPTED',
                        message: `Your quote for project matching ${quote.trade || 'General'} has been accepted! User Contact: ${userContact}`,
                        projectId: project.id
                    }
                });
            } catch (error: any) {
                // Ignore unique constraint violations
                if (error.code !== 'P2002') {
                    throw error;
                }
            }
        }
    }

    const spProfileLinks = project.quotes.map((q: any) => ({
        name: q.serviceProvider.name,
        link: `/profile/${q.serviceProvider.id}`,
        trade: q.trade
    }));

    const status = isComplete ? 'COMPLETE' : 'PARTIAL_COMPLETE';
    logger.debug('Quote aggregation calculation complete', { projectId, totalCost, status });

    return {
        status,
        projectId: project.id,
        totalCost,
        summary,
        spProfileLinks,
        isCombinedSent: true,
        missingTrades: !isComplete ? project.requiredTrades.filter((trade: string) => !providedTrades.includes(trade)) : []
    };
}
