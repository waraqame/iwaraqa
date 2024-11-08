import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, User, Settings, History } from 'lucide-react';
import { CreditHistory } from '../components/profile/CreditHistory';
import { AccountSettings } from '../components/profile/AccountSettings';
import { ProfileOverview } from '../components/profile/ProfileOverview';

export function Profile() {
  const [activeTab, setActiveTab] = useState<'overview' | 'credits' | 'settings'>('overview');
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">الملف الشخصي</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-xl border border-gray-200 p-4 h-fit">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-2 p-3 rounded-lg text-right transition-all ${
                  activeTab === 'overview'
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <User size={20} />
                <span>نظرة عامة</span>
              </button>
              
              <button
                onClick={() => setActiveTab('credits')}
                className={`w-full flex items-center gap-2 p-3 rounded-lg text-right transition-all ${
                  activeTab === 'credits'
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <History size={20} />
                <span>سجل الرصيد</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2 p-3 rounded-lg text-right transition-all ${
                  activeTab === 'settings'
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Settings size={20} />
                <span>الإعدادات</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && <ProfileOverview user={user} />}
            {activeTab === 'credits' && <CreditHistory userId={user.id} />}
            {activeTab === 'settings' && <AccountSettings user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
}