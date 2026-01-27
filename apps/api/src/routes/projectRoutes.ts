import { Router, Request, Response } from 'express';
import { prisma } from '@quoteme/database';
import { aggregateQuotesForProject } from '../lib/QuoteAggregator';

const router = Router();

// GET /api/projects/:id - Integrated Data Masking Logic
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const project = await prisma.quoteRequest.findUnique({
            where: { id },
            include: {
                user: true, // We include it but will mask it conditionally
                quotes: {
                    include: {
                        serviceProvider: {
                            select: {
                                id: true,
                                name: true,
                                rating: true,
                                status: true
                            }
                        }
                    }
                }
            }
        });

        if (!project) return res.status(404).json({ error: 'Project not found' });

        // [AUDIT PROOF] Data Masking Logic
        // User details are ONLY returned if isCombinedSent is true (Final Selection Phase)
        const { user, ...projectData } = project;

        if (project.isCombinedSent) {
            return res.json({
                ...projectData,
                user: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                }
            });
        }

        // Otherwise, return masked identity
        return res.json({
            ...projectData,
            user: {
                name: "Anonymous User",
                email: "masked@quoteme.internal",
                phone: "masked",
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

// POST /api/projects/:id/select-quote
router.post('/:id/select-quote', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { quoteId } = req.body;

        if (!quoteId) return res.status(400).json({ error: 'quoteId is required' });

        // Get the quote to find its trade
        const quoteToSelect = await prisma.quote.findUnique({
            where: { id: quoteId },
            include: { request: true }
        });

        if (!quoteToSelect) return res.status(404).json({ error: 'Quote not found' });
        if (quoteToSelect.requestId !== id) return res.status(400).json({ error: 'Quote does not belong to this project' });

        const trade = quoteToSelect.trade;

        // Transaction to unselect others and select this one
        await prisma.$transaction([
            // Unselect all other quotes for this request and trade
            prisma.quote.updateMany({
                where: {
                    requestId: id,
                    trade: trade,
                    id: { not: quoteId }
                },
                data: { isSelected: false }
            }),

            // Select the target quote
            prisma.quote.update({
                where: { id: quoteId },
                data: { isSelected: true }
            })
        ]);

        res.json({ message: 'Quote selected successfully' });
    } catch (error) {
        console.error('Select quote error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/projects/:id/finalize
router.post('/:id/finalize', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await aggregateQuotesForProject(id);
        res.json(result);
    } catch (error: any) {
        console.error('Finalize project error:', error);
        if (error.message.includes('Cannot finalize quote')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
