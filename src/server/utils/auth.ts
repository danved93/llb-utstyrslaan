import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@/shared/types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generer JWT token for bruker
 */
export function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token utløper etter 7 dager
  });
}

/**
 * Verifiser og dekod JWT token
 */
export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Ugyldig token');
  }
}

/**
 * Hash passord med bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Sammenlign passord med hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Valider passord styrke
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Passord må være minst 8 tegn langt' };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Passord må inneholde minst én liten bokstav' };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Passord må inneholde minst én stor bokstav' };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Passord må inneholde minst ett tall' };
  }

  return { isValid: true };
}

/**
 * Valider email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}