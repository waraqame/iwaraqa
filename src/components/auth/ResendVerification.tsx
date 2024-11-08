import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { sendVerificationEmail } from '../../services/email';

interface ResendVerificationProps {
  email: string;
}

export function ResendVerification({ email }: ResendVerificationProps) {
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (isSending || cooldown > 0) return;

    try {
      setIsSending(true);
      setStatus('idle');

      const success = await sendVerificationEmail(email);
      
      if (success) {
        setStatus('success');
        setCooldown(60);
        const interval = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={handleResend}
        disabled={isSending || cooldown > 0}
        className="inline-flex items-center gap-2 text-primary hover:text-primary/90 disabled:opacity-50"
      >
        {isSending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>جاري إرسال رابط جديد...</span>
          </>
        ) : cooldown > 0 ? (
          <span>يمكنك إعادة الإرسال بعد {cooldown} ثانية</span>
        ) : (
          <>
            <Send size={16} />
            <span>إعادة إرسال رابط التحقق</span>
          </>
        )}
      </button>

      {status === 'success' && (
        <p className="mt-2 text-sm text-green-600">
          تم إرسال رابط التحقق بنجاح
        </p>
      )}

      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600">
          حدث خطأ أثناء إرسال رابط التحقق
        </p>
      )}
    </div>
  );
}