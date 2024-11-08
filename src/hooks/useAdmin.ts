import { useState, useCallback } from 'react';
import { db } from '../lib/db';
import type { AdminUser, AdminStats, UsageStats } from '../types/admin';

export function useAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStats = useCallback(async (): Promise<AdminStats> => {
    try {
      setIsLoading(true);
      setError(null);

      const users = await db.users.toArray();
      const transactions = await db.creditTransactions.toArray();
      
      const stats: AdminStats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isVerified).length,
        totalCredits: users.reduce((sum, user) => sum + (user.credits || 0), 0),
        creditsUsed: transactions
          .filter(t => t.type === 'usage')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
        revenue: transactions
          .filter(t => t.type === 'purchase')
          .reduce((sum, t) => sum + t.amount, 0),
        growthRate: 0 // Calculate based on user signups over time
      };

      return stats;
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('فشل في جلب الإحصائيات');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUsers = useCallback(async (): Promise<AdminUser[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const users = await db.users.toArray();
      return users.map(user => ({
        ...user,
        status: user.isVerified ? 'active' : 'suspended',
        isAdmin: user.email === 'admin@waraqa.me',
        createdAt: new Date(user.createdAt)
      }));
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('فشل في جلب قائمة المستخدمين');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId: number, data: Partial<AdminUser>) => {
    try {
      setIsLoading(true);
      setError(null);

      await db.users.update(userId, {
        ...data,
        updatedAt: new Date()
      });

      return await db.users.get(userId);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('فشل في تحديث بيانات المستخدم');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (userId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      await db.users.delete(userId);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('فشل في حذف المستخدم');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUsageStats = useCallback(async (days: number = 30): Promise<UsageStats[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const transactions = await db.creditTransactions.toArray();
      const stats: UsageStats[] = [];

      // Group transactions by date
      const grouped = transactions.reduce((acc, t) => {
        const date = new Date(t.createdAt).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { credits: 0, revenue: 0, apiCalls: 0 };
        }
        if (t.type === 'usage') {
          acc[date].credits += Math.abs(t.amount);
          acc[date].apiCalls++;
        } else {
          acc[date].revenue += t.amount;
        }
        return acc;
      }, {} as Record<string, { credits: number; revenue: number; apiCalls: number; }>);

      // Convert to array and sort by date
      Object.entries(grouped).forEach(([date, data]) => {
        stats.push({
          date,
          users: 0, // TODO: Calculate daily active users
          credits: data.credits,
          apiCalls: data.apiCalls,
          revenue: data.revenue
        });
      });

      return stats.sort((a, b) => a.date.localeCompare(b.date));
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      setError('فشل في جلب إحصائيات الاستخدام');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getStats,
    getUsers,
    updateUser,
    deleteUser,
    getUsageStats
  };
}