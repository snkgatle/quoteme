import { Router, Request, Response } from 'express';
import { prisma } from '@quoteme/database';
import { extractTrades } from '../lib/gemini';
import { notifyServiceProviders } from '../lib/notifications';

const router = Router();

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

router.post('/', async (req: Request, res: Response) => {
    try {
        const { userEmail, userName, userPhone, latitude, longitude, description } = req.body;

        if (!latitude || !longitude || !description) {
            return res.status(400).json({ error: 'Latitude, longitude, and description are required.' });
        }

        // 1. Extract trades via Gemini AI
        const requiredTrades = await extractTrades(description);

        // 2. Upsert user and create project request
        const user = await prisma.user.upsert({
            where: { email: userEmail },
            update: { name: userName, phone: userPhone },
            create: { email: userEmail, name: userName, phone: userPhone },
        });

        const project = await prisma.quoteRequest.create({
            data: {
                userId: user.id,
                description,
                latitude,
                longitude,
                requiredTrades,
            },
        });

        // 3. Find Nearby & Active Service Providers
        // In a real high-scale app, we'd use PostGIS or a Geo-spatial index.
        // For this implementation, we fetch active providers and filter with Haversine.
        const allActiveSPs = await prisma.serviceProvider.findMany({
            where: {
                status: 'ACTIVE',
                // Optional: Filter by trades if needed at DB level, 
                // though array intersection is easier in JS for Prisma.
            },
        });

        const nearbySPs = allActiveSPs.filter((sp: any) => {
            if (!sp.latitude || !sp.longitude) return false;

            const distance = calculateDistance(latitude, longitude, sp.latitude, sp.longitude);
            const isNearby = distance <= 50; // 50km radius

            // Filter by trade match (at least one matching trade)
            const hasMatchingTrade = sp.trades.some((trade: string) => requiredTrades.includes(trade));

            return isNearby && hasMatchingTrade;
        });

        // 4. Trigger asynchronous notifications
        const spIds = nearbySPs.map((sp: any) => sp.id);
        notifyServiceProviders(spIds, project.id);

        res.status(201).json({
            message: 'Project submitted successfully',
            projectId: project.id,
            extractedTrades: requiredTrades,
            countNotified: spIds.length,
        });
    } catch (error) {
        console.error('Project submission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
