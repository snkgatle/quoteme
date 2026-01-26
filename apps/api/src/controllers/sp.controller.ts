import { Request, Response } from 'express';
import { prisma } from '@quoteme/database';
import { AuthRequest } from '../middleware/auth.middleware';

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
    const updatedSP = await prisma.serviceProvider.update({
      where: { id: user.id },
      data: {
        name: businessName,
        bio,
        latitude,
        longitude,
        trades: services,
        status: 'ACTIVE',
      },
    });

    const { password: _, ...userInfo } = updatedSP;
    res.json({ message: 'Profile updated successfully', user: userInfo });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
