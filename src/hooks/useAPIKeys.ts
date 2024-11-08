import { useState, useCallback } from 'react';
import { db } from '../lib/db';
import { resetApiKey } from '../lib/openai/config';
import type { APIKey } from '../lib/db';

export function useAPIKeys() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAPIKeys = useCallback(async (): Promise<APIKey[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const keys = await db.apiKeys.toArray();
      return keys;
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setError('فشل في جلب مفاتيح API');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addAPIKey = useCallback(async (key: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate key format
      if (!key.startsWith('sk-')) {
        throw new Error('مفتاح API غير صالح');
      }

      await db.transaction('rw', db.apiKeys, async () => {
        // Deactivate all existing keys
        await db.apiKeys
          .where('status')
          .equals('active')
          .modify({ status: 'revoked' });

        // Add new key
        await db.apiKeys.add({
          key,
          status: 'active',
          createdAt: new Date(),
          usageCount: 0
        });
      });

      // Reset OpenAI instance to use new key
      await resetApiKey();
    } catch (err) {
      console.error('Error adding API key:', err);
      setError('فشل في إضافة مفتاح API');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const revokeAPIKey = useCallback(async (keyId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await db.apiKeys.update(keyId, {
        status: 'revoked'
      });

      // Reset OpenAI instance
      await resetApiKey();
    } catch (err) {
      console.error('Error revoking API key:', err);
      setError('فشل في إلغاء مفتاح API');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getAPIKeys,
    addAPIKey,
    revokeAPIKey
  };
}