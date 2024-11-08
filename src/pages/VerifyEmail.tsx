import { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { ResendVerification } from '../components/auth/ResendVerification';
import { Mail } from 'lucide-react';

export function VerifyEmail() {
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (email) {
      // Store email in session storage for persistence across page reloads
      sessionStorage.setItem('verificationEmail', email);
    }
  }, [email]);

  const storedEmail = sessionStorage.getItem('verificationEmail');

  if (!storedEmail) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            تحقق من بريدك الإلكتروني
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            تم إرسال رابط التحقق إلى
            <br />
            <span className="font-medium text-gray-900">{storedEmail}</span>
          </p>
          <div className="mt-6">
            <ResendVerification email={storedEmail} />
          </div>
        </div>
      </div>
    </div>
  );
}