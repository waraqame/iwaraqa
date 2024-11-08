import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateContent } from '../lib/openai/api';
import { useAuth } from './AuthContext';
import { getUserCredits } from '../lib/credits';

interface AIContextType {
  remainingCredits: number;
  generateContent: (
    section: string, 
    title: string, 
    previousSections?: Record<string, string>,
    onProgress?: (content: string) => void
  ) => Promise<string>;
  continueWriting: (currentContent: string, title: string, onProgress?: (content: string) => void) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [remainingCredits, setRemainingCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, updateUserData } = useAuth();

  const refreshCredits = async () => {
    if (user?.id) {
      try {
        const credits = await getUserCredits(user.id);
        setRemainingCredits(credits);
        updateUserData({ credits });
      } catch (error) {
        console.error('[AI] Failed to fetch credits:', error);
      }
    }
  };

  useEffect(() => {
    refreshCredits();
  }, [user?.id]);

  const handleGenerate = async (
    section: string, 
    title: string, 
    previousSections = {}, 
    onProgress?: (content: string) => void
  ) => {
    if (!user?.id) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    if (!title.trim()) {
      throw new Error('يجب إدخال عنوان البحث أولاً');
    }
    
    try {
      setIsLoading(true);
      setError(null);

      const content = await generateContent(
        section,
        title,
        user.id,
        previousSections,
        {
          stream: true,
          onProgress
        }
      );

      await refreshCredits();
      return content;
    } catch (err) {
      console.error('[AI] Generation error:', err);
      const message = err instanceof Error ? err.message : 'فشل في إنشاء المحتوى';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWriting = async (currentContent: string, title: string, onProgress?: (content: string) => void) => {
    if (!user?.id) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    if (!title.trim()) {
      throw new Error('يجب إدخال عنوان البحث أولاً');
    }

    try {
      setIsLoading(true);
      setError(null);

      let streamedContent = '';
      const handleStreamProgress = (content: string) => {
        // Remove the original content from the streamed response
        const newContent = currentContent + '\n\n' + content;
        streamedContent = content;
        onProgress?.(newContent);
      };

      const content = await generateContent(
        'continue',
        title,
        user.id,
        { content: currentContent },
        { 
          stream: true,
          onProgress: handleStreamProgress
        }
      );

      await refreshCredits();
      return currentContent + '\n\n' + streamedContent;
    } catch (err) {
      console.error('[AI] Continue writing error:', err);
      const message = err instanceof Error ? err.message : 'فشل في متابعة الكتابة';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AIContext.Provider value={{
      remainingCredits,
      isLoading,
      error,
      generateContent: handleGenerate,
      continueWriting: handleContinueWriting
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}