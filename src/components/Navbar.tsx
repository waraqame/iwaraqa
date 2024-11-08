import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, LogIn, CreditCard, MessageCircle } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  const getCreditsColor = (credits: number) => {
    if (credits <= 10) return 'text-red-600';
    if (credits <= 50) return 'text-orange-500';
    return 'text-green-600';
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            ورقة
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-primary">
                لوحة التحكم
              </Link>
              <Link to="/credits" className="text-gray-600 hover:text-primary">
                <div className={`flex items-center gap-1 ${getCreditsColor(user.credits)}`}>
                  <CreditCard size={18} />
                  <span>{user.credits} نقطة</span>
                </div>
              </Link>
              <Link to="/support" className="text-gray-600 hover:text-primary">
                <MessageCircle size={18} />
              </Link>
              {user.isAdmin && (
                <Link to="/admin" className="text-gray-600 hover:text-primary">
                  الإدارة
                </Link>
              )}
              <div className="relative group">
                <button className="flex items-center gap-2">
                  <span className="hidden md:block">{user.name}</span>
                  <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-primary">
                    {user.avatar || user.name[0]}
                  </div>
                </button>
                
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-2">
                    <div className="px-3 py-2 font-semibold">{user.name}</div>
                    <div className="px-3 py-1 text-sm text-gray-500">{user.email}</div>
                    <hr className="my-2" />
                    <Link 
                      to="/profile"
                      className="block w-full text-right px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      الملف الشخصي
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full text-right px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/support" className="text-gray-600 hover:text-primary">
                <MessageCircle size={18} />
              </Link>
              <Link 
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                <LogIn size={18} />
                <span>تسجيل الدخول</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}