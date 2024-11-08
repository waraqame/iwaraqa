import { useState } from 'react';
import { Gift, Loader2, AlertCircle, Search } from 'lucide-react';
import { db } from '../../lib/db';

export function UserRewards() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rewardAmount, setRewardAmount] = useState(5);
  const [rewardDescription, setRewardDescription] = useState('مكافأة ترحيبية');

  const handleRewardAll = async () => {
    if (!window.confirm(`هل أنت متأكد من منح ${rewardAmount} نقاط لجميع المستخدمين؟`)) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await db.transaction('rw', [db.users, db.creditTransactions], async () => {
        // Get all non-admin users
        const users = await db.users
          .where('isAdmin')
          .equals(false)
          .toArray();

        // Update each user's credits
        for (const user of users) {
          await db.users.update(user.id!, {
            credits: (user.credits || 0) + rewardAmount
          });

          // Record transaction
          await db.creditTransactions.add({
            userId: user.id!,
            amount: rewardAmount,
            type: 'purchase',
            description: rewardDescription,
            createdAt: new Date()
          });
        }
      });

      setSuccess(`تم منح ${rewardAmount} نقاط لـ جميع المستخدمين بنجاح`);
    } catch (err) {
      console.error('Error rewarding users:', err);
      setError('فشل في منح النقاط');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRewardNewUsers = async () => {
    if (!window.confirm(`هل أنت متأكد من منح ${rewardAmount} نقاط للمستخدمين الجدد؟`)) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await db.transaction('rw', [db.users, db.creditTransactions], async () => {
        // Get new non-admin users
        const newUsers = await db.users
          .where('isAdmin')
          .equals(false)
          .and(user => new Date(user.createdAt) >= thirtyDaysAgo)
          .toArray();

        // Update each user's credits
        for (const user of newUsers) {
          await db.users.update(user.id!, {
            credits: (user.credits || 0) + rewardAmount
          });

          // Record transaction
          await db.creditTransactions.add({
            userId: user.id!,
            amount: rewardAmount,
            type: 'purchase',
            description: rewardDescription,
            createdAt: new Date()
          });
        }

        setSuccess(`تم منح ${rewardAmount} نقاط لـ ${newUsers.length} مستخدم جديد`);
      });
    } catch (err) {
      console.error('Error rewarding new users:', err);
      setError('فشل في منح النقاط');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">مكافآت المستخدمين</h2>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-600 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">إعدادات المكافأة</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              عدد النقاط
            </label>
            <input
              type="number"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(parseInt(e.target.value) || 0)}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              وصف المكافأة
            </label>
            <input
              type="text"
              value={rewardDescription}
              onChange={(e) => setRewardDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleRewardAll}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>جاري المعالجة...</span>
              </>
            ) : (
              <>
                <Gift size={20} />
                <span>مكافأة جميع المستخدمين</span>
              </>
            )}
          </button>

          <button
            onClick={handleRewardNewUsers}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>جاري المعالجة...</span>
              </>
            ) : (
              <>
                <Gift size={20} />
                <span>مكافأة المستخدمين الجدد</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}