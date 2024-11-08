import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function CreditsCard() {
  const { user } = useAuth();
  const credits = user?.credits || 0;

  const getColorScheme = (credits: number) => {
    if (credits <= 10) {
      return {
        bg: 'bg-red-50',
        text: 'text-red-500',
        icon: 'text-red-500'
      };
    }
    if (credits <= 50) {
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-500',
        icon: 'text-orange-500'
      };
    }
    return {
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: 'text-green-600'
    };
  };

  const colors = getColorScheme(credits);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex items-center gap-4">
        <div className={`p-3 ${colors.bg} rounded-lg`}>
          <Brain className={colors.icon} size={24} />
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${colors.text}`}>{credits}</h3>
          <p className={colors.text}>نقطة متبقية</p>
        </div>
      </div>
      {credits < 5 && (
        <div className="mt-4">
          <Link
            to="/credits"
            className="block w-full text-center bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            شراء نقاط إضافية
          </Link>
        </div>
      )}
    </div>
  );
}