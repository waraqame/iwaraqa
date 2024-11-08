import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { CreditsCard } from '../components/dashboard/CreditsCard';
import { NewProjectModal } from '../components/dashboard/NewProjectModal';
import { PlusCircle, FileText, Loader2, AlertCircle } from 'lucide-react';
import { getUserProjects, createProject } from '../services/projects';

interface Project {
  id: number;
  title: string;
  language: string;
  createdAt: Date;
  progress: number;
}

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadProjects = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const userProjects = await getUserProjects(user.id);
      setProjects(userProjects.map(project => ({
        ...project,
        createdAt: new Date(project.createdAt)
      })));
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('فشل في تحميل المشاريع');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user?.id]);

  const handleCreateProject = async (title: string, language: string) => {
    if (!user?.id) return;

    const projectId = await createProject(user.id, title, language);
    navigate(`/editor/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">أوراقي البحثية</h1>
            <p className="text-gray-600">استعرض وأكمل أوراقك البحثية</p>
          </div>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusCircle size={20} />
            <span>ورقة بحثية جديدة</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CreditsCard />
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <FileText className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{projects.length}</h3>
              <p className="text-gray-600">إجمالي الأبحاث</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <FileText className="text-yellow-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {projects.filter(p => p.progress === 100).length}
              </h3>
              <p className="text-gray-600">أبحاث مكتملة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onDelete={loadProjects}
          />
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            لا توجد مشاريع بعد. ابدأ بإنشاء مشروع جديد!
          </div>
        )}
      </div>

      <NewProjectModal 
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}