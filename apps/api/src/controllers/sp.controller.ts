import { Request, Response } from 'express';
import { prisma } from '@quoteme/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { calculateDistance } from '../lib/geo';

export const getAvailableProjects = async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const sp = await prisma.serviceProvider.findUnique({
            where: { id: user.id },
            include: { quotes: true }
        });

        if (!sp) return res.status(404).json({ error: 'Service Provider not found' });

        const { latitude: spLat, longitude: spLon, trades: spTrades, quotes: spQuotes } = sp;
        const quotedRequestIds = spQuotes.map(q => q.requestId);

        // 1. New Requests (Masked)
        const pendingProjects = await prisma.quoteRequest.findMany({
            where: {
                status: 'PENDING',
                NOT: {
                    id: { in: quotedRequestIds }
                }
            },
            include: {
                user: true
            }
        });

        const newRequests = pendingProjects.filter(project => {
            if (!spLat || !spLon || !project.latitude || !project.longitude) return false;
            const dist = calculateDistance(spLat, spLon, project.latitude, project.longitude);
            if (dist > 50) return false;

            const hasMatchingTrade = project.requiredTrades.some(trade => spTrades.includes(trade));
            return hasMatchingTrade;
        }).map(project => ({
            ...project,
            user: {
                name: 'Anonymous User',
                email: 'masked',
                phone: 'masked'
            }
        }));

        // 2. Sent Quotes
        const sentQuotes = await prisma.quote.findMany({
            where: {
                serviceProviderId: sp.id
            },
            include: {
                request: {
                    include: {
                        user: true
                    }
                }
            }
        });

        const formattedSentQuotes = sentQuotes.map(quote => {
             let statusBadge = 'Pending';
             if (quote.status === 'ACCEPTED') statusBadge = 'Awarded';
             else if (quote.status === 'REJECTED') statusBadge = 'Lost';
             else if (quote.request.status !== 'PENDING' && quote.status === 'PENDING') statusBadge = 'Lost';

             return {
                 ...quote,
                 statusBadge,
                 request: {
                     ...quote.request,
                     user: quote.status === 'ACCEPTED' ? quote.request.user : { name: 'Anonymous User' }
                 }
             };
        });

        // 3. Accepted Jobs
        const acceptedJobs = formattedSentQuotes.filter(q => q.statusBadge === 'Awarded');

        res.json({
            newRequests,
            sentQuotes: formattedSentQuotes,
            acceptedJobs
        });

    } catch (error) {
        console.error('Get available projects error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const {
    businessName,
    bio,
    latitude,
    longitude,
    services,
  } = req.body;

  try {
    const updatedSP = await prisma.serviceProvider.update({
      where: { id: user.id },
      data: {
        name: businessName,
        bio,
        latitude,
        longitude,
        trades: services,
        status: 'ACTIVE',
      },
    });

    const { password: _, ...userInfo } = updatedSP;
    res.json({ message: 'Profile updated successfully', user: userInfo });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
