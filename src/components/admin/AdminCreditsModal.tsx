import { useState } from 'react';
import { X, Loader2, AlertCircle, Plus, Minus } from 'lucide-react';
import { useCredits } from '../../hooks/useCredits';
import type { User } from '../../types';

interface AdminCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function AdminCreditsModal({ isOpen, onClose, user }: AdminCreditsModalProps) {
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [operation, setOperation] = useState<'add' | 'deduct'>('add');
  const { updateUserCredits, isLoading } = useCredits();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (amount <= 0) {
      setError('يجب أن يكون المبلغ أكبر من صفر');
      return;
    }

    try {
      const finalAmount = operation === 'add' ? amount : -amount;
      await updateUserCredits(user.id, finalAmount, description);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث الرصيد');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">
            إدارة رصيد {user.name}
          </h2>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">الرصيد الحالي</div>
            <div className="text-2xl font-bold">{user.credits}</div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع العملية
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOperation('add')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                    operation === 'add'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Plus size={16} />
                  <span>إضافة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOperation('deduct')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                    operation === 'deduct'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Minus size={16} />
                  <span>خصم</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المبلغ
              </label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الوصف
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="سبب الإضافة/الخصم"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading || amount <= 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
                  operation === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>جاري التحديث...</span>
                  </>
                ) : (
                  <>
                    {operation === 'add' ? <Plus size={16} /> : <Minus size={16} />}
                    <span>{operation === 'add' ? 'إضافة' : 'خصم'} الرصيد</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}