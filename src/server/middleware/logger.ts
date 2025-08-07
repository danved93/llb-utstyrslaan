import { Request, Response, NextFunction } from 'express';

/**
 * Enkel logger middleware
 */
export function logger(req: Request, res: Response, next: NextFunction): void {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';

  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);

  next();
}