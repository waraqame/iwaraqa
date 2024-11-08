import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          throw new Error('معرف الجلسة غير موجود');
        }

        // Wait for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setStatus('success');
        
        // Redirect after showing success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (err) {
        console.error('[Payment] Verification error:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء التحقق من الدفع');
        setStatus('error');
      }
    }

    verifyPayment();
  }, [user, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
            <h2 className="text-2xl font-bold mt-4 mb-2">جاري التحقق من الدفع</h2>
            <p className="text-gray-600">يرجى الانتظار بينما نتحقق من عملية الدفع...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="text-2xl font-bold mt-4 mb-2">تم الدفع بنجاح!</h2>
            <p className="text-gray-600 mb-6">
              تمت إضافة الرصيد إلى حسابك. سيتم توجيهك إلى لوحة التحكم...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="text-2xl font-bold mt-4 mb-2">حدث خطأ</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/credits')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
            >
              العودة للمحاولة مرة أخرى
            </button>
          </>
        )}
      </div>
    </div>
  );
}