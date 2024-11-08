import { useState, useEffect } from 'react';
import { Check, Lock } from 'lucide-react';

interface EditorSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  sectionContents: Record<string, string>;
}

export function EditorSidebar({ 
  activeSection, 
  onSectionChange,
  sectionContents = {}
}: EditorSidebarProps) {
  const [completedSections, setCompletedSections] = useState<string[]>(['title']);
  const [unlockedSections, setUnlockedSections] = useState<string[]>(['title']);

  // Define sections in correct academic order
  const sections = [
    { id: 'title', name: 'العنوان' },
    { id: 'abstract', name: 'الملخص' },
    { id: 'introduction', name: 'المقدمة' },
    { id: 'methodology', name: 'المنهجية' },
    { id: 'results', name: 'النتائج' },
    { id: 'discussion', name: 'المناقشة' },
    { id: 'conclusion', name: 'الخاتمة' }
  ];

  useEffect(() => {
    // Update completed and unlocked sections based on content
    const newCompletedSections: string[] = [];
    const newUnlockedSections = ['title'];

    for (const section of sections) {
      const content = sectionContents[section.id];
      
      // A section is completed if it has non-empty content
      if (content && content.trim().length > 0) {
        newCompletedSections.push(section.id);
        
        // Find the next section to unlock
        const currentIndex = sections.findIndex(s => s.id === section.id);
        if (currentIndex < sections.length - 1) {
          const nextSection = sections[currentIndex + 1];
          if (!newUnlockedSections.includes(nextSection.id)) {
            newUnlockedSections.push(nextSection.id);
          }
        }
      }
    }

    setCompletedSections(newCompletedSections);
    setUnlockedSections(newUnlockedSections);
  }, [sectionContents]);

  const handleSectionClick = (sectionId: string) => {
    if (unlockedSections.includes(sectionId)) {
      onSectionChange(sectionId);
    }
  };

  const progress = Math.round((completedSections.length / sections.length) * 100);

  return (
    <div className="w-72 bg-white border-l border-gray-200 p-6">
      <div className="mb-6">
        <div className="h-1 bg-gray-100 rounded-full">
          <div 
            className="h-1 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-500 text-center">
          {progress}% مكتمل
        </div>
      </div>

      <div className="space-y-2">
        {sections.map(section => {
          const isLocked = !unlockedSections.includes(section.id);
          const isCompleted = completedSections.includes(section.id);
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              disabled={isLocked}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-right transition-all ${
                isLocked
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : isCompleted
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
              }`}
            >
              <span>{section.name}</span>
              {isLocked ? (
                <Lock size={16} className="text-gray-400" />
              ) : isCompleted ? (
                <Check size={16} className="text-green-500" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}