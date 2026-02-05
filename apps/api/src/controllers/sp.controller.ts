import { Request, Response } from 'express';
import { prisma } from '@quoteme/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { calculateDistance } from '../lib/geo';
import { generateBio as generateBioFromAI } from '../lib/gemini';
import { uploadFile } from '../lib/storage';
import { sanitizeText } from '../lib/sanitize';
import { logger } from '../lib/logger';
import { TRADES } from '../lib/constants';

interface MinimalQuoteRequest {
    latitude: number | null;
    longitude: number | null;
    requiredTrades: string[];
    user: any;
    [key: string]: any;
}

interface MinimalQuote {
    requestId: string;
    status: string;
    request: {
        status: string;
        user: any;
        [key: string]: any;
    };
    [key: string]: any;
}

export const getAvailableTrades = async (req: Request, res: Response) => {
    res.json({ trades: TRADES });
};

export const generateBioContent = async (req: Request, res: Response) => {
    const { notes } = req.body;
    if (!notes) return res.status(400).json({ error: 'Notes are required' });

    try {
        const bio = await generateBioFromAI({ notes: sanitizeText(notes) });
        res.json({ bio });
    } catch (error) {
        console.error('Bio generation error:', error);
        res.status(500).json({ error: 'Failed to generate bio' });
    }
};

export const getAvailableProjects = async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const view = req.query.view as string | undefined;

    try {
        const sp = await prisma.serviceProvider.findUnique({
            where: { id: user.id },
            include: { quotes: true }
        });

        if (!sp) return res.status(404).json({ error: 'Service Provider not found' });

        const { latitude: spLat, longitude: spLon, trades: spTrades, quotes: spQuotes } = sp;

        let newRequests: any[] = [];
        let formattedSentQuotes: any[] = [];
        let acceptedJobs: any[] = [];

        // 1. New Requests (Masked)
        if (!view || view === 'requests') {
            // Ensure location is valid
            if (typeof spLat === 'number' && typeof spLon === 'number') {
                const quotedRequestIds = spQuotes.map((q: { requestId: string }) => q.requestId);

                // Calculate bounding box for 50km radius
                const latDelta = 50 / 111;
                const lonDelta = 50 / (111 * Math.cos(spLat * (Math.PI / 180)));

                const minLat = spLat - latDelta;
                const maxLat = spLat + latDelta;
                const minLon = spLon - lonDelta;
                const maxLon = spLon + lonDelta;

                const pendingProjects = await prisma.quoteRequest.findMany({
                    where: {
                        status: 'PENDING',
                        NOT: {
                            id: { in: quotedRequestIds }
                        },
                        requiredTrades: {
                            hasSome: spTrades
                        },
                        latitude: {
                            gte: minLat,
                            lte: maxLat
                        },
                        longitude: {
                            gte: minLon,
                            lte: maxLon
                        }
                    },
                    include: {
                        user: true
                    }
                });

                newRequests = pendingProjects.filter((project: MinimalQuoteRequest) => {
                    if (project.latitude === null || project.longitude === null) return false;
                    const dist = calculateDistance(spLat, spLon, project.latitude, project.longitude);
                    if (dist > 50) return false;
                    return true;
                }).map((project: MinimalQuoteRequest) => ({
                    ...project,
                    user: {
                        name: 'Anonymous User',
                        email: 'masked',
                        phone: 'masked'
                    }
                }));
            }
        }

        // 2. Sent Quotes & Accepted Jobs
        if (!view || view === 'quotes' || view === 'accepted') {
            const quoteWhere: any = { serviceProviderId: sp.id };
            if (view === 'accepted') {
                quoteWhere.status = 'ACCEPTED';
            }

            const sentQuotes = await prisma.quote.findMany({
                where: quoteWhere,
                include: {
                    request: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            formattedSentQuotes = sentQuotes.map((quote: MinimalQuote) => {
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
            acceptedJobs = formattedSentQuotes.filter((q: { statusBadge: string }) => q.statusBadge === 'Awarded');
        }

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
        const currentSP = await prisma.serviceProvider.findUnique({
            where: { id: user.id },
        });

        let certificationUrl = undefined;
        let newStatus = currentSP?.status || 'ACTIVE';

        if (req.file) {
            certificationUrl = await uploadFile(req.file);
            newStatus = 'PENDING_VERIFICATION';
        } else {
            // If finishing onboarding (was ONBOARDING) and no file uploaded -> ACTIVE
            if (currentSP?.status === 'ONBOARDING') {
                newStatus = 'ACTIVE';
            }
        }

        const updateData: any = {
            status: newStatus,
        };

        if (businessName !== undefined) updateData.name = sanitizeText(businessName);
        if (bio !== undefined) updateData.bio = sanitizeText(bio);
        if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
        if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
        if (certificationUrl) updateData.certification_url = certificationUrl;

        if (services !== undefined) {
            let parsedServices = services;
            if (typeof services === 'string') {
                try {
                    parsedServices = JSON.parse(services);
                } catch (e) {
                    parsedServices = [services];
                }
            }
            // Ensure parsedServices is array
            if (!Array.isArray(parsedServices)) {
                parsedServices = [];
            }
            updateData.trades = parsedServices.map((s: any) => sanitizeText(String(s)));
        }

        const updatedSP = await prisma.serviceProvider.update({
            where: { id: user.id },
            data: updateData,
        });

        const { password: _, ...userInfo } = updatedSP;
        res.json({ message: 'Profile updated successfully', user: userInfo });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const submitQuote = async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { requestId, amount, proposal, trade } = req.body;

    logger.info('Quote submission attempt', { serviceProviderId: user.id, requestId });

    if (!requestId || !amount || !proposal) {
        logger.warn('Quote submission missing fields', { serviceProviderId: user.id, body: req.body });
        return res.status(400).json({ error: 'Request ID, amount, and proposal are required.' });
    }

    try {
        const quote = await prisma.quote.create({
            data: {
                requestId,
                serviceProviderId: user.id,
                amount: parseFloat(amount),
                proposal: sanitizeText(proposal),
                trade: sanitizeText(trade),
                status: 'PENDING'
            }
        });

        logger.info('Quote submitted successfully', { quoteId: quote.id });
        res.status(201).json({ message: 'Quote submitted successfully', quote });
    } catch (error: any) {
        if (error.code === 'P2002') { // Prisma unique constraint violation code
            logger.warn('Duplicate quote submission attempt', { serviceProviderId: user.id, requestId });
            return res.status(409).json({ error: 'You have already submitted a quote for this request.' });
        }
        if (error.code === 'P2003') { // Prisma foreign key constraint violation code
            return res.status(404).json({ error: 'Project not found.' });
        }
        logger.error('Submit quote error', { error, serviceProviderId: user.id, requestId });
        res.status(500).json({ error: 'Failed to submit quote' });
    }
};

export const deleteAccount = async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
        await prisma.serviceProvider.delete({
            where: { id: user.id },
        });

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

export const getPerformance = async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const sp = await prisma.serviceProvider.findUnique({
            where: { id: user.id },
            include: {
                reviews: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true
                    }
                },
                quotes: {
                    where: { isSelected: true },
                    select: { id: true }
                }
            }
        });

        // Cast to any to bypass stale types in the database package if needed
        const spInfo = sp as any;

        if (!spInfo) return res.status(404).json({ error: 'Service Provider not found' });

        const projectWins = spInfo.quotes.length;

        res.json({
            rating: spInfo.rating,
            reviewCount: spInfo.reviewCount,
            projectWins,
            reviews: spInfo.reviews
        });
    } catch (error) {
        console.error('Get performance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
