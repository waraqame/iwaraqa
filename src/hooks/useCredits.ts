import { useState, useCallback } from 'react';
import { db } from '../lib/db';

export function useCredits() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserCredits = useCallback(async (userId: number, amount: number, description: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await db.transaction('rw', [db.users, db.creditTransactions], async () => {
        const user = await db.users.get(userId);
        if (!user) throw new Error('المستخدم غير موجود');

        // Check if user has enough credits for deduction
        if (amount < 0 && user.credits + amount < 0) {
          throw new Error('لا يوجد رصيد كافٍ. يرجى شراء رصيد إضافي للمتابعة.');
        }

        // Update user credits
        await db.users.update(userId, {
          credits: (user.credits || 0) + amount
        });

        // Record transaction
        await db.creditTransactions.add({
          userId,
          amount,
          type: amount > 0 ? 'purchase' : 'usage',
          description,
          createdAt: new Date()
        });
      });
    } catch (err) {
      console.error('[Credits] Error updating credits:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserCredits = useCallback(async (userId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const user = await db.users.get(userId);
      if (!user) throw new Error('المستخدم غير موجود');

      return user.credits || 0;
    } catch (err) {
      console.error('[Credits] Error getting credits:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCreditHistory = useCallback(async (userId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const transactions = await db.creditTransactions
        .where('userId')
        .equals(userId)
        .reverse()
        .sortBy('createdAt');

      return transactions;
    } catch (err) {
      console.error('[Credits] Error getting credit history:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    updateUserCredits,
    getUserCredits,
    getCreditHistory
  };
}