import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth';
import { prisma } from '@quoteme/database';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateSP = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }

    const sp = await prisma.serviceProvider.findUnique({
      where: { id: decoded.id },
    });

    if (!sp) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    authReq.user = sp;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
