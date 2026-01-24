import { Router, Request, Response } from 'express';
import { prisma } from '@quoteme/database';

const router = Router();

// GET /api/projects/:id - Integrated Data Masking Logic
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const project = await prisma.quoteRequest.findUnique({
            where: { id },
            include: {
                user: true, // We include it but will mask it conditionally
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
                }
            });
        }

        // Otherwise, return masked identity
        return res.json({
            ...projectData,
            user: {
                name: "Anonymous User",
                email: "masked@quoteme.internal",
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
