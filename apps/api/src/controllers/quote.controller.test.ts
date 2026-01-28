import { submitQuote } from './quote.controller';
import { Request, Response } from 'express';
import { prisma } from '@quoteme/database';

// Mock prisma
jest.mock('@quoteme/database', () => ({
    prisma: {
        quote: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
    },
}));

// Mock logger to avoid clutter
jest.mock('../lib/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe('submitQuote', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        mockRes = {
            status: statusMock,
            json: jsonMock,
        } as any;
        mockReq = {
            user: { id: 'sp-123' },
            body: {
                requestId: 'req-123',
                amount: 100,
                proposal: 'Test proposal',
                trade: 'Plumber',
            },
        } as any;
        jest.clearAllMocks();
    });

    it('should submit a quote successfully', async () => {
        (prisma.quote.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.quote.create as jest.Mock).mockResolvedValue({ id: 'quote-123' });

        await submitQuote(mockReq as Request, mockRes as Response);

        expect(prisma.quote.findFirst).toHaveBeenCalledWith({
            where: { requestId: 'req-123', serviceProviderId: 'sp-123' },
        });
        expect(prisma.quote.create).toHaveBeenCalledWith({
            data: {
                requestId: 'req-123',
                serviceProviderId: 'sp-123',
                amount: 100,
                proposal: 'Test proposal',
                trade: 'Plumber',
                status: 'PENDING',
            },
        });
        expect(statusMock).toHaveBeenCalledWith(201);
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: 'Quote submitted successfully' }));
    });

    it('should return 409 if quote already exists', async () => {
        (prisma.quote.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-quote' });

        await submitQuote(mockReq as Request, mockRes as Response);

        expect(statusMock).toHaveBeenCalledWith(409);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'You have already submitted a quote for this project.' });
    });

    it('should return 400 if validation fails (negative amount)', async () => {
        mockReq.body.amount = -10;

        await submitQuote(mockReq as Request, mockRes as Response);

        expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should handle Prisma unique constraint error (race condition backup)', async () => {
        (prisma.quote.findFirst as jest.Mock).mockResolvedValue(null);
        const error: any = new Error('Unique constraint');
        error.code = 'P2002';
        (prisma.quote.create as jest.Mock).mockRejectedValue(error);

        await submitQuote(mockReq as Request, mockRes as Response);

        expect(statusMock).toHaveBeenCalledWith(409);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'You have already submitted a quote for this request.' });
    });
});
