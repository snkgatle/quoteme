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
    const providedTrades = project.quotes.map(q => q.trade).filter(Boolean) as string[];
    const isComplete = project.requiredTrades.every(trade => providedTrades.includes(trade));

    if (!isComplete) {
        return {
            status: 'INCOMPLETE',
            missingTrades: project.requiredTrades.filter(trade => !providedTrades.includes(trade))
        };
    }

    // 3. Aggregate total cost
    const totalCost = project.quotes.reduce((sum, q) => sum + q.amount, 0);

    // 4. Generate professional summary via Gemini
    const summary = await generateCombinedSummary(project.description, project.quotes);

    // 5. Update database and return combined object
    const updatedProject = await prisma.quoteRequest.update({
        where: { id: projectId },
        data: {
            isCombinedSent: true,
            status: 'COMBINED_SENT'
        }
    });

    const spProfileLinks = project.quotes.map(q => ({
        name: q.serviceProvider.name,
        link: `/profile/${q.serviceProvider.id}`,
        trade: q.trade
    }));

    return {
        status: 'COMPLETE',
        projectId: project.id,
        totalCost,
        summary,
        spProfileLinks,
        isCombinedSent: true
    };
}
