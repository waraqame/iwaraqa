import { useState, useEffect } from 'react';
import { Key, Loader2, AlertCircle, Check, X } from 'lucide-react';
import { db } from '../../lib/db';
import type { APIKeyData } from '../../types/admin';

interface APIKeyListProps {
  onKeyRevoked?: () => void;
}

export function APIKeyList({ onKeyRevoked }: APIKeyListProps) {
  const [keys, setKeys] = useState<APIKeyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKeys = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get keys from both tables
      const [settings, apiKeys] = await Promise.all([
        db.settings.toArray(),
        db.apiKeys.toArray()
      ]);

      // Combine and format keys
      const allKeys: APIKeyData[] = [];

      // Add key from settings if exists
      if (settings[0]?.openaiApiKey) {
        allKeys.push({
          id: 0,
          key: settings[0].openaiApiKey,
          status: 'active',
          createdAt: settings[0].createdAt,
          lastUsedAt: undefined,
          usageCount: 0
        });
      }

      // Add keys from api_keys table
      apiKeys.forEach(key => {
        if (!allKeys.some(k => k.key === key.key)) {
          allKeys.push({
            id: key.id!,
            key: key.key,
            status: key.status as 'active' | 'revoked',
            createdAt: new Date(key.createdAt),
            lastUsedAt: key.lastUsed ? new Date(key.lastUsed) : undefined,
            usageCount: key.usageCount
          });
        }
      });

      setKeys(allKeys);
    } catch (err) {
      console.error('Error loading API keys:', err);
      setError('فشل في تحميل مفاتيح API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleRevoke = async (keyId: number) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا المفتاح؟')) return;

    try {
      await db.transaction('rw', [db.settings, db.apiKeys], async () => {
        // If it's the settings key
        if (keyId === 0) {
          const settings = await db.settings.toArray();
          if (settings[0]) {
            await db.settings.update(settings[0].id!, {
              openaiApiKey: null,
              updatedAt: new Date()
            });
          }
        } else {
          // Update api_keys table
          await db.apiKeys.update(keyId, {
            status: 'revoked'
          });
        }
      });

      await loadKeys();
      onKeyRevoked?.();
    } catch (err) {
      console.error('Error revoking API key:', err);
      setError('فشل في إلغاء مفتاح API');
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

  if (keys.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        لا يوجد مفاتيح API حالياً
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {keys.map((key) => (
        <div
          key={key.id}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Key className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="font-medium">OpenAI API Key</h3>
                <p className="text-sm text-gray-500">
                  {key.key.slice(0, 8)}...{key.key.slice(-4)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  key.status === 'active'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {key.status === 'active' ? (
                  <span className="flex items-center gap-1">
                    <Check size={14} />
                    نشط
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <X size={14} />
                    ملغي
                  </span>
                )}
              </span>
              {key.status === 'active' && (
                <button
                  onClick={() => handleRevoke(key.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  إلغاء
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500 flex gap-4">
            <span>
              تم الإنشاء: {key.createdAt.toLocaleDateString('ar-SA')}
            </span>
            {key.lastUsedAt && (
              <span>
                آخر استخدام: {key.lastUsedAt.toLocaleDateString('ar-SA')}
              </span>
            )}
            <span>عدد الاستخدام: {key.usageCount}</span>
          </div>
        </div>
      ))}
    </div>
  );
}