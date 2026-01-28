import { Request, Response } from 'express';
import { prisma } from '@quoteme/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';
import { logger } from '../lib/logger';

const SubmitQuoteSchema = z.object({
    requestId: z.string().min(1, "Request ID is required"),
    amount: z.number().positive("Bid amount must be positive"),
    proposal: z.string().min(1, "Quote details are required"),
    trade: z.string().optional(),
});

export const submitQuote = async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const { requestId, amount, proposal, trade } = SubmitQuoteSchema.parse(req.body);

        logger.info('Quote submission attempt', { serviceProviderId: user.id, requestId });

        // Double-Bid Prevention: Query to ensure spId has not already submitted a bid for this projectId
        // Note: Prisma unique constraint [requestId, serviceProviderId, trade] handles this at DB level too,
        // but explicit check allows better error message if trade is same.
        // Actually, since trade is optional/specific, we might want to check if they submitted *any* quote or a quote for *this* trade.
        // The unique constraint is on `[requestId, serviceProviderId, trade]`.
        // If trade is null, it's unique per request per SP.
        // If trade is specified, they can submit different quotes for different trades?
        // The prompt says "Double-Bid Prevention: Query the quotes table to ensure this spId has not already submitted a bid for this projectId."
        // This implies one bid per project per SP.

        const existingQuote = await prisma.quote.findFirst({
            where: {
                requestId,
                serviceProviderId: user.id
            }
        });

        if (existingQuote) {
             logger.warn('Duplicate quote submission attempt', { serviceProviderId: user.id, requestId });
             return res.status(409).json({ error: 'You have already submitted a quote for this project.' });
        }

        const quote = await prisma.quote.create({
            data: {
                requestId,
                serviceProviderId: user.id,
                amount,
                proposal,
                trade: trade || null, // Normalize undefined to null
                status: 'PENDING'
            }
        });

        logger.info('Quote submitted successfully', { quoteId: quote.id });
        res.status(201).json({ message: 'Quote submitted successfully', quote });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        if (error.code === 'P2002') { // Prisma unique constraint violation code (backup)
            logger.warn('Duplicate quote submission attempt (db)', { serviceProviderId: user.id, requestId: req.body.requestId });
            return res.status(409).json({ error: 'You have already submitted a quote for this request.' });
        }
        if (error.code === 'P2003') { // Prisma foreign key constraint violation code
             return res.status(404).json({ error: 'Project not found.' });
        }

        logger.error('Submit quote error', { error, serviceProviderId: user.id, requestId: req.body.requestId });
        res.status(500).json({ error: 'Failed to submit quote' });
    }
};
