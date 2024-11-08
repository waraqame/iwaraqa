import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProject, updateSection } from '../services/projects';
import { EditorHeader } from '../components/editor/EditorHeader';
import { EditorSidebar } from '../components/editor/EditorSidebar';
import { EditorContent } from '../components/editor/EditorContent';
import { EditorFooter } from '../components/editor/EditorFooter';

interface SectionContents {
  [key: string]: string;
}

export function Editor() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('title');
  const [wordCount, setWordCount] = useState(0);
  const [sectionContents, setSectionContents] = useState<SectionContents>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      if (!id || !user?.id) return;

      try {
        setIsLoading(true);
        setError(null);
        const project = await getProject(id, user.id);
        
        // Initialize section contents
        const contents: SectionContents = {};
        project.sections.forEach(section => {
          contents[section.type] = section.content;
        });
        setSectionContents(contents);
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    }

    loadProject();
  }, [id, user?.id, navigate]);

  const handleContentChange = async (section: string, content: string) => {
    // Update local state immediately
    setSectionContents(prev => ({
      ...prev,
      [section]: content
    }));

    // Save to database
    try {
      setIsSaving(true);
      setSaveError(null);
      if (id) {
        await updateSection(parseInt(id), section, content);
      }
    } catch (err) {
      console.error('Error saving section:', err);
      setSaveError('فشل في حفظ التغييرات');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <EditorHeader 
        isSaving={isSaving}
        onSave={() => handleContentChange(activeSection, sectionContents[activeSection] || '')}
        error={saveError}
      />
      <div className="flex-1 flex">
        <EditorSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          sectionContents={sectionContents}
        />
        <div className="flex-1 flex flex-col">
          <EditorContent 
            section={activeSection}
            currentContent={sectionContents[activeSection] || ''}
            onContentChange={(content) => handleContentChange(activeSection, content)}
            onWordCountChange={setWordCount}
            title={sectionContents.title || ''}
            previousSections={sectionContents}
          />
          <EditorFooter 
            wordCount={wordCount}
            currentContent={sectionContents[activeSection] || ''}
            section={activeSection}
            onContentChange={(content) => handleContentChange(activeSection, content)}
            title={sectionContents.title || ''}
          />
        </div>
      </div>
    </div>
  );
}