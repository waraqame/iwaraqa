import { db } from './db';

export async function getUserCredits(userId: number): Promise<number> {
  try {
    const user = await db.users.get(userId);
    return user?.credits || 0;
  } catch (error) {
    console.error('[Credits] Error getting credits:', error);
    throw new Error('فشل في التحقق من الرصيد');
  }
}

export async function updateUserCredits(
  userId: number, 
  amount: number, 
  description: string,
  metadata?: {
    projectId?: number;
    projectTitle?: string;
    section?: string;
    usageType?: 'generate' | 'continue';
  }
): Promise<void> {
  try {
    await db.transaction('rw', [db.users, db.creditTransactions], async () => {
      const user = await db.users.get(userId);
      if (!user) throw new Error('المستخدم غير موجود');

      // Check if user has enough credits for deduction
      if (amount < 0 && user.credits + amount < 0) {
        throw new Error('لا يوجد رصيد كافٍ');
      }

      // Update user credits
      await db.users.update(userId, {
        credits: user.credits + amount
      });

      // Record transaction with metadata
      await db.creditTransactions.add({
        userId,
        amount,
        type: amount > 0 ? 'purchase' : 'usage',
        description,
        projectId: metadata?.projectId,
        projectTitle: metadata?.projectTitle,
        section: metadata?.section,
        usageType: metadata?.usageType,
        createdAt: new Date()
      });
    });
  } catch (error) {
    console.error('[Credits] Error updating credits:', error);
    throw error;
  }
}

export async function refundCredit(userId: number, description: string): Promise<void> {
  try {
    await updateUserCredits(userId, 1, description);
  } catch (error) {
    console.error('[Credits] Refund error:', error);
    // Don't throw here - refund errors shouldn't block the user
  }
}