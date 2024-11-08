import { MessageCircle } from 'lucide-react';
import { SupportForm } from '../components/support/SupportForm';

export function Support() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">الدعم الفني</h1>
            <p className="text-xl text-gray-600">
              فريق الدعم الفني متواجد لمساعدتك في أي وقت
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <MessageCircle className="text-primary" size={20} />
              </div>
              <div>
                <div className="font-medium">راسلنا عبر البريد</div>
                <a href="mailto:support@waraqa.me" className="text-primary hover:underline">
                  support@waraqa.me
                </a>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">أوقات العمل</h3>
              <div className="space-y-2 text-gray-600">
                <p>الأحد - الخميس: 9:00 صباحاً - 5:00 مساءً</p>
                <p>الجمعة - السبت: مغلق</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">الأسئلة الشائعة</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">كيف يمكنني شراء نقاط إضافية؟</h4>
                  <p className="text-gray-600">يمكنك شراء نقاط إضافية من صفحة الرصيد في لوحة التحكم.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">كم تكلفة استخدام الذكاء الاصطناعي؟</h4>
                  <p className="text-gray-600">يتم خصم نقطة واحدة مقابل كل عملية إنشاء محتوى.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">هل يمكنني تصدير البحث بصيغ مختلفة؟</h4>
                  <p className="text-gray-600">نعم، يمكنك تصدير البحث بصيغة Word مع تنسيق احترافي.</p>
                </div>
              </div>
            </div>
          </div>

          <SupportForm />
        </div>
      </div>
    </div>
  );
}