import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Loader2, AlertCircle } from 'lucide-react';
import { AdminUserActions } from './AdminUserActions';
import { CreditHistoryModal } from './CreditHistoryModal';
import { AdminCreditsModal } from './AdminCreditsModal';
import { AdminUserModal } from './AdminUserModal';
import { db } from '../../lib/db';

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  credits: number;
  createdAt: Date;
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreditHistory, setShowCreditHistory] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  async function loadUsers() {
    try {
      setIsLoading(true);
      setError(null);

      // Add demo user if it doesn't exist
      const demoUser = await db.users.where('email').equals('demo@example.com').first();
      if (!demoUser) {
        await db.users.add({
          name: 'مستخدم تجريبي',
          email: 'demo@example.com',
          password: '$2a$10$rDx2nayECs1Q85aNXwyxVu2NB9POZXXm1RvYvgZx.91n0.93.N9Ym', // password123
          avatar: 'م',
          isVerified: true,
          credits: 13,
          isAdmin: false,
          createdAt: new Date()
        });
      }

      // Get all users including demo and registered
      const allUsers = await db.users.toArray();
      
      setUsers(allUsers.map(user => ({
        ...user,
        createdAt: new Date(user.createdAt),
        isAdmin: user.isAdmin || false
      })));
    } catch (err) {
      console.error('Error loading users:', err);
      setError('فشل في تحميل المستخدمين');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      return;
    }

    try {
      await db.users.delete(userId);
      await loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('فشل في حذف المستخدم');
    }
  };

  const handleUpdateRole = async (user: User) => {
    try {
      // Update user role in database
      await db.users.update(user.id, {
        isAdmin: !user.isAdmin,
        updatedAt: new Date()
      });

      // Refresh user list
      await loadUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('فشل في تحديث صلاحيات المستخدم');
    }
  };

  const handleManageCredits = (user: User) => {
    setSelectedUser(user);
    setShowCreditsModal(true);
  };

  const handleViewHistory = (user: User) => {
    setSelectedUser(user);
    setShowCreditHistory(true);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <button 
          onClick={handleAddUser}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          <span>إضافة مستخدم</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="بحث عن مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          <Filter size={20} />
          <span>تصفية</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">المستخدم</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">البريد الإلكتروني</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الصلاحيات</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الرصيد</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">تاريخ التسجيل</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-primary font-medium">
                        {user.name[0]}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      user.isAdmin ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-700'
                    }`}>
                      {user.isAdmin ? 'مدير' : 'مستخدم'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.credits}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4">
                    <AdminUserActions
                      user={user}
                      onEdit={() => handleEditUser(user)}
                      onDelete={() => handleDeleteUser(user.id)}
                      onUpdateRole={() => handleUpdateRole(user)}
                      onManageCredits={() => handleManageCredits(user)}
                      onViewHistory={() => handleViewHistory(user)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {selectedUser && (
        <>
          <CreditHistoryModal
            isOpen={showCreditHistory}
            onClose={() => {
              setShowCreditHistory(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
          />
          <AdminCreditsModal
            isOpen={showCreditsModal}
            onClose={() => {
              setShowCreditsModal(false);
              setSelectedUser(null);
              loadUsers();
            }}
            user={selectedUser}
          />
        </>
      )}

      <AdminUserModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
          loadUsers();
        }}
        user={selectedUser}
      />
    </div>
  );
}