import { useState, useEffect, useCallback } from 'react';
import { debounce } from '../utils/debounce';

interface AutoSaveOptions {
  onSave: (content: string) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({ onSave, delay = 1000, enabled = true }: AutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveContent = useCallback(
    debounce(async (content: string) => {
      if (!enabled || !content.trim()) return;

      try {
        setIsSaving(true);
        setError(null);
        await onSave(content);
        setLastSaved(new Date());
      } catch (err) {
        console.error('[AutoSave] Save failed:', err);
        setError(err instanceof Error ? err.message : 'فشل في حفظ المحتوى');
      } finally {
        setIsSaving(false);
      }
    }, delay),
    [onSave, enabled, delay]
  );

  useEffect(() => {
    return () => {
      saveContent.cancel();
    };
  }, [saveContent]);

  return {
    isSaving,
    lastSaved,
    error,
    saveContent
  };
}