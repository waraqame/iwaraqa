import { useState, useCallback } from 'react';
import { db } from '../lib/db';
import type { Settings } from '../lib/db';

const DEFAULT_SETTINGS: Settings = {
  basicPackagePrice: 100,
  proPackagePrice: 200,
  basicPackageCredits: 13,
  proPackageCredits: 30,
  maxProjectSize: 50,
  allowedLanguages: ['ar'],
  aiModel: 'gpt-3.5-turbo',
  maxTokens: 2000,
  temperature: 0.7,
  openaiApiKey: '',
  createdAt: new Date(),
  updatedAt: new Date()
};

export function useSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSettings = useCallback(async (): Promise<Settings> => {
    try {
      setIsLoading(true);
      setError(null);

      const settings = await db.settings.toArray();
      if (settings.length === 0) {
        // Initialize default settings if none exist
        const id = await db.settings.add(DEFAULT_SETTINGS);
        return { ...DEFAULT_SETTINGS, id };
      }
      return settings[0];
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('فشل في تحميل الإعدادات');
      return DEFAULT_SETTINGS;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (settings: Partial<Settings>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const currentSettings = await db.settings.toArray();
      const id = currentSettings[0]?.id;

      if (id) {
        await db.settings.update(id, {
          ...settings,
          updatedAt: new Date()
        });
      } else {
        await db.settings.add({
          ...DEFAULT_SETTINGS,
          ...settings,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('فشل في حفظ الإعدادات');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getSettings,
    updateSettings,
    isLoading,
    error
  };
}