import { Request, Response, NextFunction } from 'express';
import { statements } from '../db';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'يرجى تسجيل الدخول للمتابعة' });
    }

    const user = statements.findUserByToken.get(token);
    if (!user) {
      return res.status(401).json({ error: 'جلسة غير صالحة' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'حدث خطأ في المصادقة' });
  }
}