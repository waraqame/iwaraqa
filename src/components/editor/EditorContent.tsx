import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { AIAssistant } from './AIAssistant';

interface EditorContentProps {
  section: string;
  onWordCountChange: (count: number) => void;
  currentContent: string;
  onContentChange: (content: string) => void;
  title: string;
  previousSections: Record<string, string>;
}

export function EditorContent({ 
  section, 
  onWordCountChange,
  currentContent = '',
  onContentChange,
  title,
  previousSections
}: EditorContentProps) {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Update content when it changes externally
  useEffect(() => {
    if (contentEditableRef.current && currentContent !== contentEditableRef.current.textContent) {
      contentEditableRef.current.textContent = currentContent;
      const words = currentContent.trim().split(/\s+/).filter(Boolean).length;
      onWordCountChange(words);
    }
  }, [currentContent, onWordCountChange]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || '';
    onContentChange(text);
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    onWordCountChange(words);
  };

  const getSectionTitle = () => {
    switch (section) {
      case 'title': return 'العنوان';
      case 'abstract': return 'الملخص';
      case 'introduction': return 'المقدمة';
      case 'methodology': return 'المنهجية';
      case 'results': return 'النتائج';
      case 'discussion': return 'المناقشة';
      case 'conclusion': return 'الخاتمة';
      case 'references': return 'المراجع';
      default: return section;
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto rtl-scrollbar">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">{getSectionTitle()}</h2>
          <AIAssistant 
            section={section}
            currentContent={currentContent}
            title={title}
            onContentGenerated={onContentChange}
            onGeneratingChange={setIsGenerating}
            previousSections={previousSections}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {isGenerating && (
            <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-blue-600">
              <Loader2 className="animate-spin" size={16} />
              <span>جاري إنشاء المحتوى...</span>
            </div>
          )}
          <div
            ref={contentEditableRef}
            onInput={handleInput}
            className={`p-8 outline-none prose prose-lg max-w-none min-h-[200px] ${
              section === 'title' ? 'text-2xl font-bold' : ''
            }`}
            contentEditable
            data-placeholder={section === 'title' ? 'اكتب عنوان البحث هنا...' : 'ابدأ الكتابة هنا...'}
            dir="rtl"
          />
        </div>
      </div>
    </div>
  );
}