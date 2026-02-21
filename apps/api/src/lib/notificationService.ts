import { logger } from './logger';

const NOTIFICATION_SERVICE_URL = 'https://notification-service-477604796328.us-central1.run.app/api/v1/notify';

interface EmailNotificationParams {
    to: string;
    subject: string;
    body: string;
}

/**
 * Sends an email notification via the external notification service.
 * Wraps the external API call and handles errors gracefully.
 */
export const sendEmailNotification = async ({ to, subject, body }: EmailNotificationParams): Promise<boolean> => {
    try {
        const message = `Subject: ${subject}\n\n${body}`;

        // Placeholder for API Key if required in the future
        const apiKey = process.env.NOTIFICATION_SERVICE_API_KEY;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (apiKey) {
            // Assuming Bearer token standard if key is present, though not specified in current docs
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const payload = {
            recipient: to,
            message: message,
            type: 'email'
        };

        const response = await fetch(NOTIFICATION_SERVICE_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('Failed to send email notification', {
                status: response.status,
                statusText: response.statusText,
                error: errorText,
                recipient: to
            });
            return false;
        }

        const data = await response.json();
        logger.info('Email notification sent successfully', {
            recipient: to,
            serviceResponse: data
        });

        return true;

    } catch (error) {
        logger.error('Error sending email notification', { error });
        return false;
    }
};
