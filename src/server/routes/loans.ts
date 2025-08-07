import express from 'express';
import { prisma } from '../utils/database';
import { authenticateToken, requireApprovedBorrower, requireAdmin } from '../middleware/auth';
import { upload } from '../utils/upload';
import { LoanStatus, PhotoType } from '@/shared/types';

const router = express.Router();

/**
 * GET /api/loans
 * Hent lån for innlogget bruker eller alle lån for admin
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Bygg where clause
    const where: any = {};
    
    // Hvis ikke admin, vis kun egne lån
    if (req.user!.role !== 'ADMIN') {
      where.userId = req.user!.id;
    }

    // Filtrer på status hvis spesifisert
    if (status && Object.values(LoanStatus).includes(status as LoanStatus)) {
      where.status = status;
    }

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          loanPhotos: {
            orderBy: {
              uploadedAt: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.loan.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        loans,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/loans/:loanId
 * Hent spesifikt lån
 */
router.get('/:loanId', authenticateToken, async (req, res, next) => {
  try {
    const { loanId } = req.params;

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        loanPhotos: {
          orderBy: {
            uploadedAt: 'asc',
          },
        },
      },
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        error: { message: 'Lån ikke funnet' },
      });
    }

    // Sjekk tilgang: kun admin eller eier kan se lånet
    if (req.user!.role !== 'ADMIN' && loan.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: { message: 'Ingen tilgang til dette lånet' },
      });
    }

    res.json({
      success: true,
      data: { loan },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/loans
 * Opprett nytt lån
 */
router.post('/', authenticateToken, requireApprovedBorrower, upload.array('photos', 5), async (req, res, next) => {
  try {
    const { itemName, description, loanLocation } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!itemName || itemName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Navn på utstyr er påkrevd' },
      });
    }

    // Opprett lån
    const loan = await prisma.loan.create({
      data: {
        userId: req.user!.id,
        itemName: itemName.trim(),
        description: description?.trim(),
        loanLocation: loanLocation?.trim(),
        status: LoanStatus.ACTIVE,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Lagre bilder hvis de finnes
    if (files && files.length > 0) {
      const photoData = files.map(file => ({
        loanId: loan.id,
        photoUrl: `/uploads/${file.filename}`,
        type: PhotoType.LOAN,
        caption: `Lånt utstyr: ${itemName}`,
      }));

      await prisma.loanPhoto.createMany({
        data: photoData,
      });
    }

    // Hent komplett lån med bilder
    const completeLoan = await prisma.loan.findUnique({
      where: { id: loan.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        loanPhotos: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { 
        loan: completeLoan,
        message: 'Lån registrert' 
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/loans/:loanId/return
 * Registrer retur av lån
 */
router.put('/:loanId/return', authenticateToken, upload.array('photos', 5), async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { returnLocation, notes } = req.body;
    const files = req.files as Express.Multer.File[];

    // Finn lånet
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        error: { message: 'Lån ikke funnet' },
      });
    }

    // Sjekk tilgang: kun admin eller eier kan returnere
    if (req.user!.role !== 'ADMIN' && loan.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: { message: 'Ingen tilgang til å returnere dette lånet' },
      });
    }

    // Sjekk at lånet ikke allerede er returnert
    if (loan.status === LoanStatus.RETURNED) {
      return res.status(400).json({
        success: false,
        error: { message: 'Dette lånet er allerede returnert' },
      });
    }

    // Oppdater lån
    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: LoanStatus.RETURNED,
        returnedAt: new Date(),
        returnLocation: returnLocation?.trim(),
        notes: notes?.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Lagre returbilder hvis de finnes
    if (files && files.length > 0) {
      const photoData = files.map(file => ({
        loanId: loan.id,
        photoUrl: `/uploads/${file.filename}`,
        type: PhotoType.RETURN,
        caption: `Returnert utstyr: ${loan.itemName}`,
      }));

      await prisma.loanPhoto.createMany({
        data: photoData,
      });
    }

    // Hent komplett lån med bilder
    const completeLoan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        loanPhotos: true,
      },
    });

    res.json({
      success: true,
      data: { 
        loan: completeLoan,
        message: 'Retur registrert' 
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/loans/stats
 * Hent statistikk for admin
 */
router.get('/stats', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const [
      totalLoans,
      activeLoans,
      returnedLoans,
      overdueLoans,
      totalUsers,
      approvedUsers,
    ] = await Promise.all([
      prisma.loan.count(),
      prisma.loan.count({ where: { status: LoanStatus.ACTIVE } }),
      prisma.loan.count({ where: { status: LoanStatus.RETURNED } }),
      prisma.loan.count({ where: { status: LoanStatus.OVERDUE } }),
      prisma.user.count({ where: { role: 'BORROWER' } }),
      prisma.user.count({ where: { role: 'BORROWER', isApproved: true } }),
    ]);

    res.json({
      success: true,
      data: {
        loans: {
          total: totalLoans,
          active: activeLoans,
          returned: returnedLoans,
          overdue: overdueLoans,
        },
        users: {
          total: totalUsers,
          approved: approvedUsers,
          pending: totalUsers - approvedUsers,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;