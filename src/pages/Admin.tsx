import { useState } from 'react';
import { Users, CreditCard, Settings, BarChart2, Key, Gift } from 'lucide-react';
import { AdminStats } from '../components/admin/AdminStats';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminPayments } from '../components/admin/AdminPayments';
import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminAPIKeys } from '../components/admin/AdminAPIKeys';
import { UserRewards } from '../components/admin/UserRewards';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  // Only allow admin users
  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-l border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-6">لوحة التحكم</h2>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-2 p-3 rounded-lg text-right transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <BarChart2 size={20} />
            <span>نظرة عامة</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-2 p-3 rounded-lg text-right transition-all ${
              activeTab === 'users'
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Users size={20} />
            <span>المستخدمين</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-2 p-3 rounded-lg text-right transition-all ${
              activeTab === 'payments'
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <CreditCard size={20} />
            <span>المدفوعات</span>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`w-full flex items-center gap-2 p-3 rounded-lg text-right transition-all ${
              activeTab === 'rewards'
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Gift size={20} />
            <span>المكافآت</span>
          </button>
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`w-full flex items-center gap-2 p-3 rounded-lg text-right transition-all ${
              activeTab === 'api-keys'
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Key size={20} />
            <span>مفاتيح API</span>
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
      <div className="flex-1 p-8">
        {activeTab === 'overview' && <AdminStats />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'payments' && <AdminPayments />}
        {activeTab === 'rewards' && <UserRewards />}
        {activeTab ==='api-keys' && <AdminAPIKeys />}
        {activeTab === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
}