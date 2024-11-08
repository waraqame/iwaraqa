import { useState, useEffect } from 'react';
import { APIKeyForm } from './APIKeyForm';
import { APIKeyList } from './APIKeyList';
import { AlertCircle } from 'lucide-react';
import { db } from '../../lib/db';

export function AdminAPIKeys() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check both settings and api_keys tables
        const [settings, activeKeys] = await Promise.all([
          db.settings.toArray(),
          db.apiKeys.where('status').equals('active').toArray()
        ]);
        
        if (!settings[0]?.openaiApiKey && activeKeys.length === 0) {
          setError('لم يتم تكوين مفتاح API بعد. يرجى إضافة مفتاح للبدء في استخدام الذكاء الاصطناعي.');
        }
      } catch (err) {
        console.error('Error checking API key:', err);
        setError('حدث خطأ أثناء التحقق من مفاتيح API');
      } finally {
        setIsLoading(false);
      }
    };

    checkApiKey();
  }, [refreshKey]);

  const handleSuccess = async () => {
    // Reset OpenAI instance to use new key
    await resetApiKey();
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة مفاتيح API</h1>

      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">إضافة مفتاح جديد</h2>
        <APIKeyForm onSuccess={handleSuccess} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">المفاتيح الحالية</h2>
        <APIKeyList key={refreshKey} onKeyRevoked={handleSuccess} />
      </div>
    </div>
  );
}