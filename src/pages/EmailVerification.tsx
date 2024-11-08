import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { verifyEmail } from '../services/email';

export function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const token = searchParams.get('token');

  useEffect(() => {
    async function verify() {
      try {
        if (!token) {
          setStatus('error');
          return;
        }

        const success = await verifyEmail(token);
        setStatus(success ? 'success' : 'error');

        if (success) {
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
      }
    }

    verify();
  }, [token, navigate]);

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
                تم التحقق من بريدك الإلكتروني بنجاح. سيتم توجيهك إلى صفحة تسجيل الدخول...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                فشل التحقق
              </h2>
              <p className="mt-2 text-gray-600">
                عذراً، لم نتمكن من التحقق من بريدك الإلكتروني. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 text-primary hover:text-primary/90"
              >
                العودة إلى تسجيل الدخول
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}