import { Router, Request, Response } from 'express';
import { prisma } from '@quoteme/database';
import { extractTrades } from '../lib/gemini';
import { notifyServiceProviders } from '../lib/notifications';
import { calculateDistance } from '../lib/geo';

const router = Router();

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
                trades: {
                    hasSome: requiredTrades,
                },
            },
        });

        const nearbySPs = allActiveSPs.filter((sp: any) => {
            if (!sp.latitude || !sp.longitude) return false;

            const distance = calculateDistance(latitude, longitude, sp.latitude, sp.longitude);
            const isNearby = distance <= 50; // 50km radius

            return isNearby;
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
