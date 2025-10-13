import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export {};