import { useState } from 'react';
import { CreditCard, Check, Loader2, AlertCircle } from 'lucide-react';
import { createCheckoutSession, PACKAGES } from '../lib/stripe';
import { useAuth } from '../contexts/AuthContext';

export function Credits() {
  const [selectedPackage, setSelectedPackage] = useState<keyof typeof PACKAGES | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handlePurchase = async () => {
    if (!selectedPackage || !user) {
      setError('يرجى تسجيل الدخول واختيار باقة للمتابعة');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const baseUrl = window.location.origin;
      await createCheckoutSession(
        selectedPackage,
        `${baseUrl}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
        `${baseUrl}/credits`
      );
    } catch (err) {
      console.error('[Credits] Payment error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">شراء رصيد إضافي</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(PACKAGES).map(([id, pkg]) => (
            <div
              key={id}
              className={`bg-white rounded-xl border p-6 cursor-pointer transition-all ${
                selectedPackage === id
                  ? 'border-primary ring-2 ring-primary/10'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => setSelectedPackage(id as keyof typeof PACKAGES)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{pkg.name}</h3>
                  <p className="text-3xl font-bold text-primary mb-4">
                    {pkg.price} <span className="text-lg font-normal">ريال</span>
                  </p>
                </div>
                {selectedPackage === id && (
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
                    <Check size={16} />
                  </div>
                )}
              </div>

              <div className="text-lg mb-4">{pkg.credits} رصيد</div>

              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-600">
                  <Check size={16} className="text-primary" />
                  <span>دعم كامل للذكاء الاصطناعي</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check size={16} className="text-primary" />
                  <span>تصدير بصيغ متعددة</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check size={16} className="text-primary" />
                  <span>دعم اللغتين العربية والإنجليزية</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check size={16} className="text-primary" />
                  <span>تنسيق تلقائي للمراجع</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={handlePurchase}
            disabled={!selectedPackage || isProcessing || !user}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              {isProcessing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>جاري تجهيز عملية الدفع...</span>
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  <span>شراء الآن</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}