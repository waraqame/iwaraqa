import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Save, FileDown, AlertCircle, Check } from 'lucide-react';

interface EditorHeaderProps {
  isSaving: boolean;
  onSave: () => void;
  error: string | null;
}

export function EditorHeader({ isSaving, onSave, error }: EditorHeaderProps) {
  const { id } = useParams();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="h-16 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link to="/dashboard" className="hover:text-primary">
            لوحة التحكم
          </Link>
          <ChevronRight size={16} />
          <span className="text-gray-900">المحرر</span>
        </div>

        <div className="flex items-center gap-3">
          {error && (
            <div className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <Link 
            to={`/export/${id}`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 min-w-[100px] justify-center"
          >
            <FileDown size={16} />
            <span>تصدير</span>
          </Link>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 disabled:opacity-50 min-w-[100px] justify-center transition-colors"
          >
            {isSaving ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>يحفظ...</span>
              </>
            ) : (
              <>
                {error === null ? <Save size={16} /> : <Check size={16} className="text-green-500" />}
                <span>{error === null ? 'حفظ' : 'تم الحفظ'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}