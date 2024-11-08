import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, FileText, Wand2, ArrowDown } from 'lucide-react';
import { db } from '../../lib/db';

interface CreditHistoryProps {
  userId: number;
}

interface Transaction {
  id: number;
  type: 'purchase' | 'usage';
  amount: number;
  description: string;
  createdAt: string | Date;
  projectId?: number;
  projectTitle?: string;
  usageType?: 'generate' | 'continue';
  section?: string;
}

export function CreditHistory({ userId }: CreditHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTransactions() {
      try {
        setIsLoading(true);
        setError(null);

        // Get transactions with project details
        const history = await db.transaction('r', [db.creditTransactions, db.projects], async () => {
          const txns = await db.creditTransactions
            .where('userId')
            .equals(userId)
            .reverse()
            .toArray();

          // Enhance transactions with project details
          const enhanced = await Promise.all(txns.map(async txn => {
            if (txn.type === 'usage' && txn.description.includes('الذكاء الاصطناعي')) {
              // Extract project ID and section from description if available
              const projectMatch = txn.description.match(/مشروع (\d+)/);
              const projectId = projectMatch ? parseInt(projectMatch[1]) : undefined;
              
              if (projectId) {
                const project = await db.projects.get(projectId);
                return {
                  ...txn,
                  projectId,
                  projectTitle: project?.title,
                  usageType: txn.description.includes('متابعة الكتابة') ? 'continue' : 'generate',
                  section: txn.description.split(' - ')[1]
                };
              }
            }
            return txn;
          }));

          return enhanced;
        });

        // Group by date
        const formattedHistory = history.map(transaction => ({
          ...transaction,
          createdAt: new Date(transaction.createdAt)
        }));

        setTransactions(formattedHistory);
      } catch (err) {
        console.error('Error loading credit history:', err);
        setError('فشل في تحميل سجل الرصيد');
      } finally {
        setIsLoading(false);
      }
    }

    loadTransactions();
  }, [userId]);

  const formatDate = (date: Date) => {
    try {
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'تاريخ غير صالح';
    }
  };

  const formatTime = (date: Date) => {
    try {
      return date.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = formatDate(new Date(transaction.createdAt));
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">سجل الرصيد</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
          <div key={date} className="p-6">
            <div className="text-sm font-medium text-gray-500 mb-4">{date}</div>
            <div className="space-y-4">
              {dayTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'purchase' 
                        ? 'bg-green-50' 
                        : transaction.usageType === 'continue'
                        ? 'bg-blue-50'
                        : 'bg-purple-50'
                    }`}>
                      {transaction.type === 'purchase' ? (
                        <FileText className="text-green-600" size={20} />
                      ) : transaction.usageType === 'continue' ? (
                        <ArrowDown className="text-blue-600" size={20} />
                      ) : (
                        <Wand2 className="text-purple-600" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.type === 'purchase' ? 'إضافة رصيد' : (
                          transaction.usageType === 'continue' ? 'متابعة الكتابة' : 'اكتب لي'
                        )}
                      </p>
                      {transaction.projectTitle && (
                        <p className="text-sm text-gray-600 mt-1">
                          {transaction.projectTitle}
                          {transaction.section && ` - ${transaction.section}`}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {formatTime(new Date(transaction.createdAt))}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${
                    transaction.type === 'purchase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'purchase' ? '+' : '-'}{Math.abs(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {transactions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            لا يوجد سجل للمعاملات
          </div>
        )}
      </div>
    </div>
  );
}