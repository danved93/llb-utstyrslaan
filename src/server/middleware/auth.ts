import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { prisma } from '../utils/database';
import { UserRole } from '@/shared/types';

// Utvid Express Request type med user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        isApproved: boolean;
      };
    }
  }
}

/**
 * Middleware for å autentisere JWT token
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        success: false, 
        error: { message: 'Access token mangler' } 
      });
      return;
    }

    const payload = verifyToken(token);
    
    // Hent bruker fra database for å sikre at den fortsatt eksisterer
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      res.status(401).json({ 
        success: false, 
        error: { message: 'Bruker ikke funnet' } 
      });
      return;
    }

    // Legg til brukerinfo i request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      isApproved: user.isApproved,
    };

    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: { message: 'Ugyldig token' } 
    });
  }
}

/**
 * Middleware for å sjekke at bruker er admin
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      error: { message: 'Ikke autentisert' } 
    });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ 
      success: false, 
      error: { message: 'Krever admin tilgang' } 
    });
    return;
  }

  next();
}

/**
 * Middleware for å sjekke at bruker er godkjent låntaker
 */
export function requireApprovedBorrower(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      error: { message: 'Ikke autentisert' } 
    });
    return;
  }

  if (!req.user.isApproved && req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ 
      success: false, 
      error: { message: 'Du må være godkjent som låntaker for å utføre denne handlingen' } 
    });
    return;
  }

  next();
}