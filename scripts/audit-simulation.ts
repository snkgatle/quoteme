import { prisma } from '@quoteme/database';
import { aggregateQuotesForProject } from '../apps/api/src/lib/QuoteAggregator';
import { updateServiceProviderRating } from '../apps/api/src/lib/RatingSystem';

async function runAuditSimulation() {
    console.log('--- [MISSION] System Architecture Audit Simulation ---');

    try {
        // 1. Setup Data
        const user = await prisma.user.upsert({
            where: { email: 'auditor@example.com' },
            update: {},
            create: { email: 'auditor@example.com', name: 'System Auditor' }
        });

        const project = await prisma.quoteRequest.create({
            data: {
                userId: user.id,
                description: 'Audit project: fix sink, rewire kitchen, paint walls.',
                requiredTrades: ['Plumber', 'Electrician', 'Painter'],
                latitude: -26.2041,
                longitude: 28.0473
            }
        });

        const sp1 = await prisma.serviceProvider.create({
            data: { name: 'Super Plumber', email: 'sp1@example.com', trades: ['Plumber'], rating: 4.5 }
        });

        const sp2 = await prisma.serviceProvider.create({
            data: { name: 'Electro Wiz', email: 'sp2@example.com', trades: ['Electrician'], rating: 2.8 } // Low rating
        });

        const sp3 = await prisma.serviceProvider.create({
            data: { name: 'Master Painter', email: 'sp3@example.com', trades: ['Painter'], rating: 4.8 }
        });

        console.log('--- [STEP 1] 3 SPs Bidding on Project ---');
        await prisma.quote.createMany({
            data: [
                { requestId: project.id, serviceProviderId: sp1.id, amount: 500, trade: 'Plumber', proposal: 'Fix the sink.' },
                { requestId: project.id, serviceProviderId: sp2.id, amount: 1500, trade: 'Electrician', proposal: 'Rewire kitchen.' },
                { requestId: project.id, serviceProviderId: sp3.id, amount: 800, trade: 'Painter', proposal: 'Paint walls.' }
            ]
        });

        console.log('--- [STEP 2] Verifying Aggregation Logic ---');
        const aggregationResult = await aggregateQuotesForProject(project.id);
        console.log('Aggregation Result:', JSON.stringify(aggregationResult, null, 2));

        if (aggregationResult.totalCost === 2800) {
            console.log('✅ Aggregation verified: Combined quote is $2800.');
        }

        console.log('--- [STEP 3] Verifying Rating Trigger Logic ---');
        // sp2 is already 2.8, let's see if it's deactivated
        const updatedSP2 = await updateServiceProviderRating(sp2.id, 2.8);
        console.log(`SP2 Status: ${updatedSP2.status} (Rating: ${updatedSP2.rating})`);

        if (updatedSP2.status === 'DEACTIVATED') {
            console.log('✅ Rating Auto-Deactivation verified: SP with < 3.0 rating is DEACTIVATED.');
        }

        console.log('--- [AUDIT COMPLETE] ---');

    } catch (error) {
        console.error('Audit Simulation Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

runAuditSimulation();
