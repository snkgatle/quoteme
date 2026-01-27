import { Request, Response } from 'express';
import { prisma } from '@quoteme/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { calculateDistance } from '../lib/geo';
import { generateBio as generateBioFromAI } from '../lib/gemini';
import { uploadFile } from '../lib/storage';
import { logger } from '../lib/logger';

export const generateBioContent = async (req: Request, res: Response) => {
    const { notes } = req.body;
    if (!notes) return res.status(400).json({ error: 'Notes are required' });

    try {
        const bio = await generateBioFromAI({ notes });
        res.json({ bio });
    } catch (error) {
        console.error('Bio generation error:', error);
        res.status(500).json({ error: 'Failed to generate bio' });
    }
};

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

        const lat = latitude ? parseFloat(latitude) : undefined;
        const lon = longitude ? parseFloat(longitude) : undefined;

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
            name: businessName,
            bio,
            latitude: lat,
            longitude: lon,
            trades: parsedServices,
            status: newStatus,
        };

        if (certificationUrl) {
            updateData.certification_url = certificationUrl;
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
                proposal,
                trade,
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
