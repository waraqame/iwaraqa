import { useState, useCallback } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';
import { useAI } from '../../contexts/AIContext';

interface EditorFooterProps {
  wordCount: number;
  currentContent: string;
  section: string;
  title: string;
  onContentChange: (content: string) => void;
}

export function EditorFooter({ 
  wordCount, 
  currentContent = '',
  section,
  onContentChange,
  title = ''
}: EditorFooterProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { continueWriting, remainingCredits, error: aiError } = useAI();
  const [error, setError] = useState<string | null>(null);

  const handleProgress = useCallback((content: string) => {
    onContentChange(content);
  }, [onContentChange]);

  const handleContinueWriting = async () => {
    if (!currentContent.trim() || isGenerating || remainingCredits <= 0) return;

    if (!title.trim()) {
      setError('يجب إدخال عنوان البحث أولاً');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      await continueWriting(currentContent, title, handleProgress);
      
    } catch (err) {
      console.error('[Editor] Continue writing error:', err);
      setError(err instanceof Error ? err.message : 'فشل في متابعة الكتابة');
    } finally {
      setIsGenerating(false);
    }
  };

  if (section === 'title') return null;

  return (
    <div className="h-16 bg-white border-t border-gray-200 px-8 flex items-center justify-between">
      <button
        onClick={handleContinueWriting}
        disabled={!currentContent.trim() || isGenerating || remainingCredits <= 0}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isGenerating || !currentContent.trim() || remainingCredits <= 0
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>جاري الكتابة...</span>
          </>
        ) : (
          <>
            <ArrowDown size={16} />
            <span>متابعة الكتابة</span>
          </>
        )}
      </button>

      <div className="flex items-center gap-4">
        {(error || aiError) && (
          <div className="text-sm text-red-500">
            {error || aiError}
          </div>
        )}
        <div className="px-3 py-1.5 text-sm bg-gray-50 text-gray-600 rounded-md border border-gray-200">
          {wordCount} كلمة
        </div>
      </div>
    </div>
  );
}