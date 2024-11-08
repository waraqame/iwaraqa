import { useState, useEffect } from 'react';
import { Save, Loader2, AlertCircle } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import type { Settings } from '../../lib/db';

const DEFAULT_SETTINGS: Settings = {
  basicPackagePrice: 100,
  proPackagePrice: 200,
  basicPackageCredits: 13,
  proPackageCredits: 30,
  maxProjectSize: 50,
  allowedLanguages: ['ar'],
  aiModel: 'gpt-3.5-turbo',
  maxTokens: 2000,
  temperature: 0.7,
  openaiApiKey: '',
  createdAt: new Date(),
  updatedAt: new Date()
};

export function AdminSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const { getSettings, updateSettings, isLoading, error: apiError } = useSettings();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await getSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(null);

      // Validate settings
      if (settings.basicPackagePrice <= 0 || settings.proPackagePrice <= 0) {
        throw new Error('يجب أن تكون أسعار الباقات أكبر من صفر');
      }

      if (settings.basicPackageCredits <= 0 || settings.proPackageCredits <= 0) {
        throw new Error('يجب أن تكون عدد النقاط في الباقات أكبر من صفر');
      }

      if (settings.maxProjectSize <= 0) {
        throw new Error('يجب أن يكون الحد الأقصى لحجم المشروع أكبر من صفر');
      }

      if (settings.allowedLanguages.length === 0) {
        throw new Error('يجب اختيار لغة واحدة على الأقل');
      }

      await updateSettings(settings);
      setSuccess('تم حفظ الإعدادات بنجاح');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'فشل في حفظ الإعدادات');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إعدادات النظام</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-6">
          {(error || apiError) && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error || apiError}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 text-green-600 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{success}</span>
            </div>
          )}

          {/* Package Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">إعدادات الباقات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سعر الباقة الأساسية
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={settings.basicPackagePrice}
                    onChange={(e) => setSettings({ ...settings, basicPackagePrice: Number(e.target.value) })}
                    className="flex-1 border border-gray-200 rounded-r-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="bg-gray-50 border border-r-0 border-gray-200 px-4 py-2 text-gray-500 rounded-l-lg">
                    ريال
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد النقاط في الباقة الأساسية
                </label>
                <input
                  type="number"
                  value={settings.basicPackageCredits}
                  onChange={(e) => setSettings({ ...settings, basicPackageCredits: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سعر الباقة المتقدمة
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={settings.proPackagePrice}
                    onChange={(e) => setSettings({ ...settings, proPackagePrice: Number(e.target.value) })}
                    className="flex-1 border border-gray-200 rounded-r-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="bg-gray-50 border border-r-0 border-gray-200 px-4 py-2 text-gray-500 rounded-l-lg">
                    ريال
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد النقاط في الباقة المتقدمة
                </label>
                <input
                  type="number"
                  value={settings.proPackageCredits}
                  onChange={(e) => setSettings({ ...settings, proPackageCredits: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">إعدادات الذكاء الاصطناعي</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نموذج OpenAI
                </label>
                <select
                  value={settings.aiModel}
                  onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأقصى للكلمات
                </label>
                <input
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings({ ...settings, maxTokens: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  درجة الإبداعية (0.0 - 1.0)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">إعدادات النظام</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأقصى لحجم المشروع (ميجابايت)
                </label>
                <input
                  type="number"
                  value={settings.maxProjectSize}
                  onChange={(e) => setSettings({ ...settings, maxProjectSize: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اللغات المدعومة
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.allowedLanguages.includes('ar')}
                      onChange={(e) => {
                        const langs = e.target.checked
                          ? [...settings.allowedLanguages, 'ar']
                          : settings.allowedLanguages.filter(l => l !== 'ar');
                        setSettings({ ...settings, allowedLanguages: langs });
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary ml-2"
                    />
                    العربية
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.allowedLanguages.includes('en')}
                      onChange={(e) => {
                        const langs = e.target.checked
                          ? [...settings.allowedLanguages, 'en']
                          : settings.allowedLanguages.filter(l => l !== 'en');
                        setSettings({ ...settings, allowedLanguages: langs });
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary ml-2"
                    />
                    الإنجليزية
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>حفظ الإعدادات</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}