import { sendEmailNotification } from './notificationService';
import { logger } from './logger';

// Mock logger
jest.mock('./logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('sendEmailNotification', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should send email successfully', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'queued' }),
        });

        const result = await sendEmailNotification({
            to: 'test@example.com',
            subject: 'Test Subject',
            body: 'Test Body',
        });

        expect(result).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://notification-service-477604796328.us-central1.run.app/api/v1/notify',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify({
                    recipient: 'test@example.com',
                    message: 'Subject: Test Subject\n\nTest Body',
                    type: 'email',
                }),
            })
        );
        expect(logger.info).toHaveBeenCalled();
    });

    it('should return false when API returns error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            text: async () => 'Server Error',
        });

        const result = await sendEmailNotification({
            to: 'test@example.com',
            subject: 'Test Subject',
            body: 'Test Body',
        });

        expect(result).toBe(false);
        expect(logger.error).toHaveBeenCalledWith('Failed to send email notification', expect.anything());
    });

    it('should return false when fetch fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network Error'));

        const result = await sendEmailNotification({
            to: 'test@example.com',
            subject: 'Test Subject',
            body: 'Test Body',
        });

        expect(result).toBe(false);
        expect(logger.error).toHaveBeenCalledWith('Error sending email notification', expect.anything());
    });
});
