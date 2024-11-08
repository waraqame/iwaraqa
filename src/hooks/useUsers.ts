import { useState, useCallback } from 'react';
import { db } from '../lib/db';
import type { User } from '../types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const allUsers = await db.users.toArray();
      setUsers(allUsers.map(user => ({
        ...user,
        createdAt: new Date(user.createdAt),
        isAdmin: user.email === 'admin@waraqa.me'
      })));
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('فشل في جلب قائمة المستخدمين');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addUser = useCallback(async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError('');
      
      // Check if email exists
      const existingUser = await db.users.where('email').equals(userData.email!).first();
      if (existingUser) {
        throw new Error('البريد الإلكتروني مستخدم بالفعل');
      }

      const id = await db.users.add({
        ...userData,
        createdAt: new Date(),
        isVerified: true,
        credits: userData.credits || 13
      });

      await fetchUsers();
      return id;
    } catch (err) {
      console.error('Error adding user:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (userId: number, userData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError('');
      
      // Check if email exists for other users
      if (userData.email) {
        const existingUser = await db.users
          .where('email')
          .equals(userData.email)
          .first();
        
        if (existingUser && existingUser.id !== userId) {
          throw new Error('البريد الإلكتروني مستخدم بالفعل');
        }
      }

      await db.users.update(userId, {
        ...userData,
        updatedAt: new Date()
      });

      await fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId: number) => {
    try {
      setIsLoading(true);
      setError('');
      
      // Check if user exists
      const user = await db.users.get(userId);
      if (!user) {
        throw new Error('المستخدم غير موجود');
      }

      // Don't allow deleting admin user
      if (user.email === 'admin@waraqa.me') {
        throw new Error('لا يمكن حذف المستخدم الرئيسي');
      }

      await db.users.delete(userId);
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  const updateCredits = useCallback(async (userId: number, amount: number, description: string) => {
    try {
      setIsLoading(true);
      setError('');

      await db.transaction('rw', [db.users, db.creditTransactions], async () => {
        const user = await db.users.get(userId);
        if (!user) throw new Error('المستخدم غير موجود');

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

      await fetchUsers();
    } catch (err) {
      console.error('Error updating credits:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    updateCredits
  };
}