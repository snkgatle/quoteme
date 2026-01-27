import { prisma } from '@quoteme/database';
import { generateCombinedSummary } from './gemini';

export async function aggregateQuotesForProject(projectId: string) {
    // 1. Fetch project with its quotes and service providers
    const project = await prisma.quoteRequest.findUnique({
        where: { id: projectId },
        include: {
            quotes: {
                include: {
                    serviceProvider: true
                }
            }
        }
    });

    if (!project) {
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
            return {
                status: 'INCOMPLETE',
                missingTrades: project.requiredTrades.filter((trade: string) => !providedTrades.includes(trade))
            };
        }
        // If > 48h, proceed to generate Partial Combined Quote
    }

    // 3. Aggregate total cost using only selected quotes
    const selectedQuotes = project.quotes.filter((q: any) => q.isSelected);

    // Validate: Ensure all selected SPs are ACTIVE
    const inactiveProviders = selectedQuotes.filter((q: any) => q.serviceProvider.status !== 'ACTIVE');
    if (inactiveProviders.length > 0) {
        const names = inactiveProviders.map((q: any) => q.serviceProvider.name).join(', ');
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
    }

    const spProfileLinks = project.quotes.map((q: any) => ({
        name: q.serviceProvider.name,
        link: `/profile/${q.serviceProvider.id}`,
        trade: q.trade
    }));

    return {
        status: isComplete ? 'COMPLETE' : 'PARTIAL_COMPLETE',
        projectId: project.id,
        totalCost,
        summary,
        spProfileLinks,
        isCombinedSent: true,
        missingTrades: !isComplete ? project.requiredTrades.filter((trade: string) => !providedTrades.includes(trade)) : []
    };
}
