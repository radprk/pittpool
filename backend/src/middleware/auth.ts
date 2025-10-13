import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Extend the Request interface directly
declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    user?: any;
  }
}

export type AuthRequest = Request;

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
};