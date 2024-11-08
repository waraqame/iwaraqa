import { db } from './db';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  userId: number;
}

interface RateLimitInfo {
  remaining: number;
  reset: number;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private userRequests: Map<number, { count: number; resetTime: number }>;
  private globalRequests: { count: number; resetTime: number };

  private constructor() {
    this.userRequests = new Map();
    this.globalRequests = { count: 0, resetTime: Date.now() };
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  async checkLimit({ windowMs, maxRequests, userId }: RateLimitConfig): Promise<RateLimitInfo> {
    const now = Date.now();

    // Check user-specific limit
    let userLimit = this.userRequests.get(userId);
    if (!userLimit || now > userLimit.resetTime) {
      userLimit = { count: 0, resetTime: now + windowMs };
      this.userRequests.set(userId, userLimit);
    }

    // Check global limit
    if (now > this.globalRequests.resetTime) {
      this.globalRequests = { count: 0, resetTime: now + windowMs };
    }

    // Get user's remaining credits
    const user = await db.users.get(userId);
    if (!user || user.credits <= 0) {
      return {
        remaining: 0,
        reset: userLimit.resetTime
      };
    }

    const isWithinLimits = 
      userLimit.count < maxRequests && 
      this.globalRequests.count < maxRequests * 2;

    if (isWithinLimits) {
      userLimit.count++;
      this.globalRequests.count++;
      return {
        remaining: maxRequests - userLimit.count,
        reset: userLimit.resetTime
      };
    }

    return {
      remaining: 0,
      reset: userLimit.resetTime
    };
  }

  async consumeCredit(userId: number): Promise<boolean> {
    return db.transaction('rw', db.users, db.creditTransactions, async () => {
      const user = await db.users.get(userId);
      if (!user || user.credits <= 0) return false;

      await db.users.update(userId, {
        credits: user.credits - 1
      });

      await db.creditTransactions.add({
        userId,
        amount: -1,
        type: 'usage',
        description: 'استخدام الذكاء الاصطناعي',
        createdAt: new Date()
      });

      return true;
    });
  }
}

export const rateLimiter = RateLimiter.getInstance();