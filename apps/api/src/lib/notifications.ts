import { prisma } from '@quoteme/database';
import { sendEmailNotification } from './notificationService';
import { logger } from './logger';

export async function notifyServiceProviders(providerIds: string[], requestId: string) {
    logger.info(`[Notification] Processing alerts for ${providerIds.length} providers for request ${requestId}...`);

    try {
        // Fetch provider emails
        const providers = await prisma.serviceProvider.findMany({
            where: {
                id: { in: providerIds },
                status: 'ACTIVE'
            },
            select: {
                id: true,
                email: true,
                name: true
            }
        });

        if (providers.length === 0) {
            logger.info(`[Notification] No active providers found for ids: ${providerIds.join(', ')}`);
            return;
        }

        // Send notifications in parallel
        const notificationPromises = providers.map(async (provider: { id: string; email: string; name: string | null }) => {
            const subject = 'New Project Opportunity';
            const body = `Hello ${provider.name || 'Partner'},\n\nA new project matching your trades is available (ID: ${requestId}).\n\nLog in to your dashboard to view details and submit a quote.`;

            const sent = await sendEmailNotification({
                to: provider.email,
                subject,
                body
            });

            if (sent) {
                 logger.info(`[Notification] Alert sent to provider ${provider.id} for request ${requestId}`);
            } else {
                 logger.warn(`[Notification] Failed to send alert to provider ${provider.id}`);
            }
        });

        // We use Promise.all to wait for all notifications to be attempted
        // This makes the function async but "blocking" until all emails are sent (or failed)
        // If the caller wants fire-and-forget, they should not await this function or we should wrap this in setImmediate/process.nextTick
        // However, in the projectSubmission route, we didn't await it:
        // `notifyServiceProviders(spIds, project.id);` was called without await.
        // So keeping it async is fine, it will run in background relative to the request handler if not awaited.
        await Promise.all(notificationPromises);

    } catch (error) {
        logger.error('[Notification] Error in notifyServiceProviders', { error });
    }
}
