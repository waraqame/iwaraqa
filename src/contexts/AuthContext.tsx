import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as authLogin, register as authRegister, type User, type AuthError } from '../services/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUserData: (data: Partial<User>) => void;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUserData = localStorage.getItem('user');
        if (savedUserData) {
          const parsedUser = JSON.parse(savedUserData);
          // Validate required fields
          if (parsedUser && parsedUser.id && parsedUser.email) {
            setUser(parsedUser);
          } else {
            // Invalid user data, clear storage
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        // Clear potentially corrupted data
        localStorage.removeItem('user');
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  const updateUserData = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      try {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (err) {
        console.error('Error saving user data:', err);
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await authLogin(email, password);
      setUser(userData);
      try {
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        console.error('Error saving user data:', err);
      }
    } catch (err) {
      const error = err as AuthError;
      setError(error.message || 'حدث خطأ أثناء تسجيل الدخول');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await authRegister(name, email, password);
      setUser(userData);
      try {
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        console.error('Error saving user data:', err);
      }
    } catch (err) {
      const error = err as AuthError;
      setError(error.message || 'حدث خطأ أثناء إنشاء الحساب');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register,
      updateUserData,
      isLoading,
      isInitialized,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}