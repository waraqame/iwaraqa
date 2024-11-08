import { Link } from 'react-router-dom';
import { FileText, Brain, Languages, Download, CheckCircle2, ArrowRight } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              طوّر أبحاثك بمساعدة الذكاء الاصطناعي
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              منصة متكاملة تساعدك في كتابة وتنظيم أبحاثك بكفاءة عالية. استفد من قوة الذكاء الاصطناعي في تطوير محتوى أبحاثك بشكل احترافي.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium"
              >
                ابدأ الآن مجاناً
              </Link>
              <Link
                to="/login"
                className="border border-gray-300 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors text-lg"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">المميزات الرئيسية</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Brain className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">ذكاء اصطناعي متقدم</h3>
              <p className="text-gray-600">يساعدك في كتابة وتحسين محتوى بحثك بشكل احترافي</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <FileText className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">هيكلة تلقائية</h3>
              <p className="text-gray-600">تنظيم تلقائي لأقسام البحث وفق المعايير الأكاديمية</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Languages className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">دعم متعدد اللغات</h3>
              <p className="text-gray-600">دعم كامل للغتين العربية والإنجليزية في كتابة الأبحاث</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Download className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">تصدير احترافي</h3>
              <p className="text-gray-600">تصدير بحثك بصيغ متعددة مع تنسيق احترافي</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">لماذا تختار منصتنا؟</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              'توفير الوقت والجهد في كتابة الأبحاث العلمية',
              'تحسين جودة المحتوى باستخدام الذكاء الاصطناعي',
              'تنظيم تلقائي للمراجع والاقتباسات',
              'واجهة سهلة الاستخدام ومصممة للباحثين',
              'دعم فني متواصل ومتابعة مستمرة',
              'أسعار تنافسية وباقات متنوعة'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-100">
                <CheckCircle2 className="text-primary flex-shrink-0" size={24} />
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">ابدأ في كتابة بحثك الآن</h2>
            <p className="text-xl text-gray-600 mb-8">
              انضم إلى آلاف الباحثين الذين يستخدمون منصتنا لتطوير أبحاثهم
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium"
            >
              <span>إنشاء حساب مجاني</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}