import express from 'express';
import { prisma } from '../utils/database';
import { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  validatePassword, 
  validateEmail 
} from '../utils/auth';
import { authenticateToken } from '../middleware/auth';
import { LoginRequest, RegisterRequest, UserRole } from '@/shared/types';

const router = express.Router();

/**
 * POST /api/auth/register
 * Registrer ny bruker
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password }: RegisterRequest = req.body;

    // Valider input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Alle felt er påkrevd' },
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Ugyldig email format' },
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: { message: passwordValidation.message },
      });
    }

    // Sjekk om bruker allerede eksisterer
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: 'En bruker med denne email adressen eksisterer allerede' },
      });
    }

    // Hash passord og opprett bruker
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash,
        role: UserRole.BORROWER,
        isApproved: false,
      },
    });

    // Generer token
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      isApproved: user.isApproved,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Logg inn bruker
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Valider input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email og passord er påkrevd' },
      });
    }

    // Finn bruker
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Ugyldig email eller passord' },
      });
    }

    // Sjekk passord
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { message: 'Ugyldig email eller passord' },
      });
    }

    // Generer token
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      isApproved: user.isApproved,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Hent innlogget brukers info
 */
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
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

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Bruker ikke funnet' },
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logg ut bruker (frontend håndterer token fjerning)
 */
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: { message: 'Logget ut' },
  });
});

export default router;