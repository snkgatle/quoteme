import { Request, Response } from 'express';
import { prisma } from '@quoteme/database';
import { hashPassword, comparePassword, signToken } from '../lib/auth';
import { AuthRequest } from '../middleware/auth.middleware';

export const loginOrRegister = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    let sp = await prisma.serviceProvider.findUnique({
      where: { email },
    });

    if (sp) {
      // Login
      const isValid = await comparePassword(password, sp.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = signToken({ id: sp.id, email: sp.email });
      const { password: _, ...userWithoutPassword } = sp;
      return res.json({ token, isNew: false, user: userWithoutPassword });
    } else {
      // Register (Onboarding)
      const hashedPassword = await hashPassword(password);
      sp = await prisma.serviceProvider.create({
        data: {
          email,
          password: hashedPassword,
          status: 'ONBOARDING',
        },
      });

      const token = signToken({ id: sp.id, email: sp.email });
      const { password: _, ...userWithoutPassword } = sp;
      return res.status(201).json({ token, isNew: true, user: userWithoutPassword });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  const { password, ...userInfo } = user;
  res.json(userInfo);
};
