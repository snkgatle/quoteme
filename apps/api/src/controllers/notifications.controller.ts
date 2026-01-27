import { Request, Response } from 'express';
import { prisma } from '@quoteme/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { calculateDistance } from '../lib/geo';

export const getNotifications = async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const sp = await prisma.serviceProvider.findUnique({
            where: { id: user.id },
            include: { quotes: true }
        });

        if (!sp) return res.status(404).json({ error: 'Service Provider not found' });

        // Lazy Generation: Closing Soon
        // Logic: Projects created > 24h ago and < 48h ago.
        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const closingSoonProjects = await prisma.quoteRequest.findMany({
            where: {
                status: 'PENDING',
                createdAt: {
                    gte: fortyEightHoursAgo,
                    lt: twentyFourHoursAgo
                }
            }
        });

        // Filter for matching projects
        const matchedProjects = closingSoonProjects.filter(project => {
            // Check trades
            const hasMatchingTrade = project.requiredTrades.some(trade => sp.trades.includes(trade));
            if (!hasMatchingTrade) return false;

            // Check distance
            if (!sp.latitude || !sp.longitude || !project.latitude || !project.longitude) return false;
            const dist = calculateDistance(sp.latitude, sp.longitude, project.latitude, project.longitude);
            if (dist > 50) return false;

            // Check if already quoted
            const hasQuoted = sp.quotes.some(q => q.requestId === project.id);
            if (hasQuoted) return false;

            return true;
        });

        // Create notifications if they don't exist
        for (const project of matchedProjects) {
            const exists = await prisma.notification.findFirst({
                where: {
                    serviceProviderId: sp.id,
                    type: 'CLOSING_SOON',
                    projectId: project.id
                }
            });

            if (!exists) {
                try {
                    await prisma.notification.create({
                        data: {
                            serviceProviderId: sp.id,
                            type: 'CLOSING_SOON',
                            message: `Project matching ${project.requiredTrades.join(', ')} is closing soon!`,
                            projectId: project.id
                        }
                    });
                } catch (error: any) {
                    // Ignore unique constraint violations (race conditions)
                    if (error.code !== 'P2002') {
                        throw error;
                    }
                }
            }
        }

        // Fetch all notifications
        const notifications = await prisma.notification.findMany({
            where: { serviceProviderId: sp.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;

    try {
        // Ensure notification belongs to SP
        const count = await prisma.notification.count({
            where: { id, serviceProviderId: user.id }
        });

        if (count === 0) return res.status(404).json({ error: 'Notification not found' });

        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        res.json({ message: 'Marked as read' });
    } catch (error) {
        console.error('Mark as read error', error);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
};
