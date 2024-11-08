import { db } from '../lib/db';

export async function useCredit(userId: number, description: string): Promise<boolean> {
  try {
    let success = false;
    
    await db.transaction('rw', [db.users, db.creditTransactions], async () => {
      const user = await db.users.get(userId);
      if (!user) throw new Error('المستخدم غير موجود');
      
      if (user.credits <= 0) {
        throw new Error('لا يوجد رصيد كافٍ. يرجى شراء رصيد إضافي للمتابعة.');
      }

      // Deduct 1 credit for each AI operation
      await db.users.update(userId, {
        credits: user.credits - 1
      });

      // Record transaction
      await db.creditTransactions.add({
        userId,
        amount: -1,
        type: 'usage',
        description,
        createdAt: new Date()
      });

      success = true;
    });

    return success;
  } catch (error) {
    console.error('[Credits] Error using credit:', error);
    throw error;
  }
}

export async function addCredits(userId: number, amount: number, description: string): Promise<void> {
  try {
    await db.transaction('rw', [db.users, db.creditTransactions], async () => {
      const user = await db.users.get(userId);
      if (!user) throw new Error('المستخدم غير موجود');

      await db.users.update(userId, {
        credits: user.credits + amount
      });

      await db.creditTransactions.add({
        userId,
        amount,
        type: 'purchase',
        description,
        createdAt: new Date()
      });
    });
  } catch (error) {
    console.error('[Credits] Error adding credits:', error);
    throw error;
  }
}

export async function getUserCredits(userId: number): Promise<number> {
  try {
    const user = await db.users.get(userId);
    return user?.credits || 0;
  } catch (error) {
    console.error('[Credits] Error getting credits:', error);
    return 0;
  }
}