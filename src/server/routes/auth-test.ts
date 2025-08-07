import express from 'express';
import { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  validatePassword, 
  validateEmail 
} from '../utils/auth';
import { LoginRequest, RegisterRequest, UserRole } from '../../shared/types';

const router = express.Router();

// Test brukere (hardkodet for testing)
const testUsers = [
  {
    id: 'test-admin-id',
    name: 'Trygve Admin',
    email: 'trygve@admin.no',
    passwordHash: '$2a$12$l4T6pum3XrdCEjQI75HJreGJN16vYWupzRmGauB0pLWY0qtA/.xHi', // Passord123
    role: 'ADMIN' as UserRole,
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'test-user-id',
    name: 'Test Bruker',
    email: 'test@example.com',
    passwordHash: '$2a$12$ch1bfMKdalbJyBOc4U.yMOCDAhhPaHEIWyT/1um7obBEdsnk9TglG', // TestPass123
    role: 'BORROWER' as UserRole,
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

/**
 * POST /api/auth/login
 * Test innlogging uten database
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password }: LoginRequest = req.body;

    console.log('🔐 Test innlogging forsøk:', { email, password });

    // Valider input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email og passord er påkrevd' },
      });
    }

    // Finn test bruker
    const user = testUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.log('❌ Bruker ikke funnet:', email);
      return res.status(401).json({
        success: false,
        error: { message: 'Ugyldig email eller passord' },
      });
    }

    // Sjekk passord
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      console.log('❌ Ugyldig passord for:', email);
      return res.status(401).json({
        success: false,
        error: { message: 'Ugyldig email eller passord' },
      });
    }

    console.log('✅ Innlogging vellykket for:', email);

    // Generer token
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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
    console.error('❌ Innlogging feil:', error);
    next(error);
  }
});

/**
 * POST /api/auth/register
 * Test registrering (returnerer bare suksess)
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password }: RegisterRequest = req.body;

    console.log('📝 Test registrering forsøk:', { name, email });

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

    // Sjekk om test bruker allerede eksisterer
    const existingUser = testUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: 'En bruker med denne email adressen eksisterer allerede' },
      });
    }

    console.log('✅ Test registrering vellykket for:', email);

    // Simuler ny bruker opprettelse
    const newUser = {
      id: 'test-new-user-' + Date.now(),
      name: name.trim(),
      email: email.toLowerCase(),
      role: 'BORROWER' as UserRole,
      isApproved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Generer token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      data: {
        user: newUser,
        token,
      },
    });
  } catch (error) {
    console.error('❌ Registrering feil:', error);
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Hent innlogget brukers info (mock)
 */
router.get('/me', (req, res) => {
  // For testing, returner bare suksess
  res.json({
    success: true,
    data: {
      user: testUsers[0] // Returner admin bruker som default
    },
  });
});

export default router;