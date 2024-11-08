import { Link } from 'react-router-dom';
import { FileText, ExternalLink, Trash2 } from 'lucide-react';
import { deleteProject } from '../../services/projects';

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    language: string;
    createdAt: Date;
    progress: number;
  };
  onDelete?: () => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const { id, title, language, createdAt, progress } = project;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      return;
    }

    try {
      await deleteProject(id);
      onDelete?.();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('فشل في حذف المشروع');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-primary hover:shadow-md hover:-translate-y-0.5">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-4 line-clamp-2 h-14">
          {title || 'ابدأ بكتابة عنوان بحثك...'}
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-primary">
            {language}
          </span>
          <span>
            {language === 'العربية' ? 'تم الإنشاء:' : 'Created:'} {formatDate(createdAt)}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="h-1.5 bg-gray-100 rounded-full mb-3">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm mb-4">
          <span className="text-gray-600">
            {language === 'العربية' ? `${progress}% مكتمل` : `${progress}% complete`}
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/editor/${id}`}
            className="flex-1 bg-primary text-white text-center py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            {language === 'العربية' ? 'متابعة الكتابة' : 'Continue Writing'}
          </Link>
          <Link
            to={`/export/${id}`}
            className="flex items-center justify-center px-4 py-3 text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ExternalLink size={20} />
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center px-4 py-3 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}