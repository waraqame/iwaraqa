import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VerificationStatusProps {
  status: 'loading' | 'success' | 'error';
  message?: string;
}

export function VerificationStatus({ status, message }: VerificationStatusProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                جاري التحقق من بريدك الإلكتروني
              </h2>
              <p className="mt-2 text-gray-600">
                يرجى الانتظار بينما نتحقق من بريدك الإلكتروني...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                تم التحقق بنجاح
              </h2>
              <p className="mt-2 text-gray-600">
                {message || 'تم تأكيد بريدك الإلكتروني بنجاح'}
              </p>
              <Link
                to="/login"
                className="mt-4 inline-block text-primary hover:text-primary/90"
              >
                العودة إلى تسجيل الدخول
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                فشل التحقق
              </h2>
              <p className="mt-2 text-gray-600">
                {message || 'عذراً، لم نتمكن من التحقق من بريدك الإلكتروني'}
              </p>
              <Link
                to="/login"
                className="mt-4 inline-block text-primary hover:text-primary/90"
              >
                العودة إلى تسجيل الدخول
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}