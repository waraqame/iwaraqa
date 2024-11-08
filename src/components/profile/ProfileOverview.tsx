import { CreditCard, FileText, Calendar } from 'lucide-react';
import type { User } from '../../types';

interface ProfileOverviewProps {
  user: User;
}

export function ProfileOverview({ user }: ProfileOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-semibold">
            {user.avatar || user.name[0]}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <CreditCard className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{user.credits}</h3>
              <p className="text-gray-600">رصيد متبقي</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <FileText className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">13</h3>
              <p className="text-gray-600">مشروع</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {new Date(user.createdAt).toLocaleDateString('ar-SA')}
              </h3>
              <p className="text-gray-600">تاريخ التسجيل</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}