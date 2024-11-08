import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProject } from '../services/projects';
import { FileText, Download, Settings, ChevronRight, ZoomIn, ZoomOut, Loader2, AlertCircle, Lock } from 'lucide-react';
import { useExport } from '../hooks/useExport';

interface Section {
  title: string;
  content: string;
}

export function Export() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [format, setFormat] = useState<'docx'>('docx');
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { exportDocument, isExporting } = useExport();

  // Order sections in correct academic sequence
  const orderedSections = ['abstract', 'introduction', 'methodology', 'results', 'discussion', 'conclusion'];
  const totalPages = orderedSections.length;

  useEffect(() => {
    async function loadProject() {
      if (!id || !user?.id) return;

      try {
        setIsLoading(true);
        setError(null);
        const projectData = await getProject(id, user.id);
        setProject(projectData);
      } catch (err) {
        console.error('Error loading project:', err);
        setError('فشل في تحميل المشروع');
      } finally {
        setIsLoading(false);
      }
    }

    loadProject();
  }, [id, user?.id]);

  const handleExport = async () => {
    if (!project) return;

    const sections = orderedSections
      .map(type => project.sections.find((s: any) => s.type === type))
      .filter(Boolean)
      .map((section: any) => ({
        title: section.type === 'abstract' ? 'الملخص' :
               section.type === 'introduction' ? 'المقدمة' :
               section.type === 'methodology' ? 'المنهجية' :
               section.type === 'results' ? 'النتائج' :
               section.type === 'discussion' ? 'المناقشة' :
               section.type === 'conclusion' ? 'الخاتمة' : section.type,
        content: section.content || ''
      }));

    await exportDocument(format, sections, project.title, user?.name || '');
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in' && zoom < 200) {
      setZoom(prev => prev + 10);
    } else if (direction === 'out' && zoom > 50) {
      setZoom(prev => prev - 10);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error || 'المشروع غير موجود'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Link to="/dashboard" className="hover:text-primary">
              لوحة التحكم
            </Link>
            <ChevronRight size={16} />
            <Link to={`/editor/${id}`} className="hover:text-primary">
              المحرر
            </Link>
            <ChevronRight size={16} />
            <span className="text-gray-900">تصدير</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Preview Panel */}
          <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Preview Toolbar */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    صفحة {currentPage} من {totalPages}
                  </span>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
                    <button
                      onClick={() => handleZoom('out')}
                      className="p-1.5 hover:bg-gray-100 rounded-lg"
                      disabled={zoom <= 50}
                    >
                      <ZoomOut size={16} />
                    </button>
                    <span className="text-sm px-2">{zoom}%</span>
                    <button
                      onClick={() => handleZoom('in')}
                      className="p-1.5 hover:bg-gray-100 rounded-lg"
                      disabled={zoom >= 200}
                    >
                      <ZoomIn size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                  >
                    السابق
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                  >
                    التالي
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-8 bg-gray-100 min-h-[calc(100vh-200px)] overflow-auto">
              <div 
                className="mx-auto transition-transform duration-200 origin-top"
                style={{ 
                  transform: `scale(${zoom/100})`,
                  width: `${Math.min(100, 100 * (100/zoom))}%`
                }}
              >
                <div className="bg-white shadow-lg mx-auto max-w-[850px] p-16 min-h-[1100px]">
                  <h1 className="text-3xl font-bold text-center mb-8">
                    {project.title}
                  </h1>
                  <p className="text-center text-gray-600 mb-12">
                    إعداد: {user?.name}
                  </p>
                  {orderedSections.map((type, index) => {
                    const section = project.sections.find((s: any) => s.type === type);
                    if (!section) return null;

                    return (
                      <div key={type} className={`mb-8 ${index + 1 === currentPage ? '' : 'hidden'}`}>
                        <h2 className="text-xl font-semibold mb-4">
                          {type === 'abstract' ? 'الملخص' :
                           type === 'introduction' ? 'المقدمة' :
                           type === 'methodology' ? 'المنهجية' :
                           type === 'results' ? 'النتائج' :
                           type === 'discussion' ? 'المناقشة' :
                           type === 'conclusion' ? 'الخاتمة' : type}
                        </h2>
                        <div className="text-justify leading-relaxed whitespace-pre-wrap">
                          {section.content || 'لا يوجد محتوى'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="w-80 bg-white rounded-xl shadow-sm p-6 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <Settings size={20} className="text-gray-600" />
              <h2 className="text-xl font-semibold">إعدادات التصدير</h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                صيغة الملف
              </label>
              <div className="space-y-2">
                {/* PDF Option - Disabled */}
                <div className="flex items-center p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-not-allowed">
                  <FileText size={18} className="text-gray-400 ml-2" />
                  <span className="text-gray-400">PDF</span>
                  <span className="mr-auto flex items-center gap-1 text-sm text-gray-400">
                    <Lock size={14} />
                    قريباً
                  </span>
                </div>

                {/* DOCX Option */}
                <div className="flex items-center p-3 rounded-lg cursor-pointer border border-primary bg-blue-50">
                  <input
                    type="radio"
                    name="format"
                    value="docx"
                    checked={format === 'docx'}
                    onChange={(e) => setFormat(e.target.value as 'docx')}
                    className="hidden"
                  />
                  <FileText size={18} className="text-primary ml-2" />
                  <span>Word (DOCX)</span>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-primary text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-75"
            >
              {isExporting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>جاري التصدير...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>تصدير الملف</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}