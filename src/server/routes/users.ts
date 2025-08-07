import express from 'express';
import { prisma } from '../utils/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { UserRole } from '@/shared/types';

const router = express.Router();

/**
 * GET /api/users
 * Hent alle brukere (kun for admin)
 */
router.get('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            loans: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/pending
 * Hent brukere som venter på godkjenning (kun for admin)
 */
router.get('/pending', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: {
        isApproved: false,
        role: UserRole.BORROWER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { users: pendingUsers },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/:userId/approve
 * Godkjenn eller avslå bruker (kun for admin)
 */
router.put('/:userId/approve', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { approved } = req.body;

    if (typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: { message: 'approved må være true eller false' },
      });
    }

    // Sjekk at bruker eksisterer
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: { message: 'Bruker ikke funnet' },
      });
    }

    // Oppdater godkjenningsstatus
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isApproved: approved },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { 
        user: updatedUser,
        message: approved ? 'Bruker godkjent' : 'Bruker avslått',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/:userId/role
 * Endre brukerrolle (kun for admin)
 */
router.put('/:userId/role', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Ugyldig rolle' },
      });
    }

    // Sjekk at bruker eksisterer
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: { message: 'Bruker ikke funnet' },
      });
    }

    // Hindre at admin endrer sin egen rolle
    if (existingUser.id === req.user!.id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Du kan ikke endre din egen rolle' },
      });
    }

    // Oppdater rolle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { 
        user: updatedUser,
        message: `Brukerrolle endret til ${role}`,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/users/:userId
 * Slett bruker (kun for admin)
 */
router.delete('/:userId', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Sjekk at bruker eksisterer
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: { message: 'Bruker ikke funnet' },
      });
    }

    // Hindre at admin sletter seg selv
    if (existingUser.id === req.user!.id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Du kan ikke slette deg selv' },
      });
    }

    // Slett bruker (Prisma vil automatisk slette relaterte lån pga Cascade)
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      success: true,
      data: { message: 'Bruker slettet' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;