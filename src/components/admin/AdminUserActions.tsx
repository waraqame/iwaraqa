import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, Shield, ShieldOff, CreditCard, History } from 'lucide-react';
import type { User } from '../../types';

interface AdminUserActionsProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateRole: () => void;
  onManageCredits: () => void;
  onViewHistory: () => void;
}

export function AdminUserActions({
  user,
  onEdit,
  onDelete,
  onUpdateRole,
  onManageCredits,
  onViewHistory
}: AdminUserActionsProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 hover:bg-gray-100 rounded-lg"
      >
        <MoreVertical size={20} />
      </button>

      {showMenu && (
        <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
          <button
            onClick={() => handleAction(onEdit)}
            className="w-full px-4 py-2 text-right text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Pencil size={16} />
            <span>تعديل</span>
          </button>

          <button
            onClick={() => handleAction(onManageCredits)}
            className="w-full px-4 py-2 text-right text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <CreditCard size={16} />
            <span>إدارة الرصيد</span>
          </button>

          <button
            onClick={() => handleAction(onViewHistory)}
            className="w-full px-4 py-2 text-right text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <History size={16} />
            <span>سجل الرصيد</span>
          </button>

          <button
            onClick={() => handleAction(onUpdateRole)}
            className="w-full px-4 py-2 text-right text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            {user.isAdmin ? (
              <>
                <ShieldOff size={16} />
                <span>إلغاء صلاحيات المدير</span>
              </>
            ) : (
              <>
                <Shield size={16} />
                <span>منح صلاحيات مدير</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleAction(onDelete)}
            className="w-full px-4 py-2 text-right text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 size={16} />
            <span>حذف</span>
          </button>
        </div>
      )}
    </div>
  );
}