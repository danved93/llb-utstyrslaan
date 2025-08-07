import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('🚨 Server error:', error);

  // Prisma spesifikke feil
  if (error.code === 'P2002') {
    res.status(409).json({
      success: false,
      error: {
        message: 'En ressurs med denne verdien eksisterer allerede',
        code: 'DUPLICATE_ENTRY',
      },
    });
    return;
  }

  if (error.code === 'P2025') {
    res.status(404).json({
      success: false,
      error: {
        message: 'Ressurs ikke funnet',
        code: 'NOT_FOUND',
      },
    });
    return;
  }

  // Standard feil
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Intern server feil';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: error.code || 'INTERNAL_SERVER_ERROR',
    },
  });
}