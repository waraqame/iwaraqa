import { useState, useCallback } from 'react';
import { Wand2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAI } from '../../contexts/AIContext';
import { getUserCredits } from '../../lib/credits';

interface AIAssistantProps {
  section: string;
  currentContent: string;
  title: string;
  previousSections: Record<string, string>;
  onContentGenerated?: (content: string) => void;
  onGeneratingChange?: (isGenerating: boolean) => void;
  projectId?: number;
  projectTitle?: string;
}

export function AIAssistant({ 
  section, 
  currentContent = '',
  title,
  previousSections,
  onContentGenerated,
  onGeneratingChange,
  projectId,
  projectTitle
}: AIAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { generateContent } = useAI();

  const handleProgress = useCallback((content: string) => {
    onContentGenerated?.(content);
  }, [onContentGenerated]);

  const handleGenerate = async () => {
    if (!user?.id) {
      setError('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      onGeneratingChange?.(true);

      // Check credits before starting
      const credits = await getUserCredits(user.id);
      if (credits <= 0) {
        throw new Error('لا يوجد رصيد كافٍ. يرجى شراء رصيد إضافي للمتابعة.');
      }

      const content = await generateContent(
        section,
        title,
        previousSections,
        handleProgress,
        {
          projectId,
          projectTitle
        }
      );

      // Content validation is now handled in the API
    } catch (err) {
      console.error('[AI] Generation error:', {
        name: err.name,
        message: err.message,
        code: err.code,
        status: err.status,
        type: err.type
      });
      
      setError(err instanceof Error ? err.message : 'فشل في إنشاء المحتوى');
    } finally {
      setIsGenerating(false);
      onGeneratingChange?.(false);
    }
  };

  if (section === 'title' || section === 'references') return null;

  return (
    <div className="flex items-center gap-4">
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
          isGenerating
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>جاري الكتابة...</span>
          </>
        ) : (
          <>
            <Wand2 size={16} />
            <span>اكتب لي</span>
          </>
        )}
      </button>
    </div>
  );
}