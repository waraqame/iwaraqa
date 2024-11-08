import { useState } from 'react';
import { Key, Save, Loader2, AlertCircle } from 'lucide-react';
import { db } from '../../lib/db';

interface APIKeyFormProps {
  onSuccess?: () => void;
}

export function APIKeyForm({ onSuccess }: APIKeyFormProps) {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.startsWith('sk-')) {
      setError('مفتاح API غير صالح');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Store in both settings and api_keys tables for compatibility
      await db.transaction('rw', [db.settings, db.apiKeys], async () => {
        // Update settings
        const settings = await db.settings.toArray();
        if (settings.length > 0) {
          await db.settings.update(settings[0].id!, {
            openaiApiKey: apiKey,
            updatedAt: new Date()
          });
        } else {
          await db.settings.add({
            openaiApiKey: apiKey,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }

        // Add to api_keys
        await db.apiKeys.add({
          key: apiKey,
          status: 'active',
          createdAt: new Date(),
          usageCount: 0
        });
      });

      setApiKey('');
      onSuccess?.();
    } catch (err) {
      console.error('Error adding API key:', err);
      setError('فشل في إضافة مفتاح API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          مفتاح OpenAI API
        </label>
        <div className="relative">
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Key size={20} className="text-gray-400" />
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          يمكنك الحصول على المفتاح من{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            لوحة تحكم OpenAI
          </a>
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading || !apiKey}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>جاري الحفظ...</span>
          </>
        ) : (
          <>
            <Save size={20} />
            <span>حفظ المفتاح</span>
          </>
        )}
      </button>
    </form>
  );
}