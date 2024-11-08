import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { useCredits } from '../../hooks/useCredits';
import type { User } from '../../types';

interface CreditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function CreditHistoryModal({ isOpen, onClose, user }: CreditHistoryModalProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const { getCreditHistory, isLoading, error } = useCredits();

  useEffect(() => {
    if (isOpen && user) {
      getCreditHistory(user.id).then(setTransactions);
    }
  }, [isOpen, user, getCreditHistory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">
            سجل رصيد {user.name}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="overflow-y-auto max-h-[calc(90vh-12rem)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا يوجد سجل للمعاملات
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {transaction.type === 'purchase' ? 'إضافة رصيد' : 'استخدام رصيد'}
                        </p>
                        <p className="text-sm text-gray-600">{transaction.description}</p>
                      </div>
                      <div className={`text-lg font-semibold ${
                        transaction.type === 'purchase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'purchase' ? '+' : '-'}{Math.abs(transaction.amount)}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString('ar-SA')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}