import { useState, useEffect } from 'react';
import { Users, CreditCard, Brain, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { UsageChart } from './UsageChart';
import { RevenueChart } from './RevenueChart';
import type { AdminStats as Stats } from '../../types/admin';

export function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [usageData, setUsageData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const { getStats, getUsageStats, isLoading, error } = useAdmin();

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, usageStats] = await Promise.all([
          getStats(),
          getUsageStats(30) // Last 30 days
        ]);

        setStats(statsData);

        // Process usage data
        const usage = usageStats.map(stat => ({
          date: stat.date,
          credits: stat.credits
        }));
        setUsageData(usage);

        // Process revenue data
        const revenue = usageStats.map(stat => ({
          date: stat.date,
          revenue: stat.revenue
        }));
        setRevenueData(revenue);
      } catch (err) {
        console.error('Error loading admin stats:', err);
      }
    }

    loadData();
  }, [getStats, getUsageStats]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">نظرة عامة</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              <p className="text-gray-600">إجمالي المستخدمين</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp size={16} />
            <span className="mr-1">+{stats.growthRate}% هذا الشهر</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <CreditCard className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{stats.revenue} ريال</h3>
              <p className="text-gray-600">إجمالي المبيعات</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Brain className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{stats.creditsUsed}</h3>
              <p className="text-gray-600">نقاط مستخدمة</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Users className="text-yellow-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{stats.activeUsers}</h3>
              <p className="text-gray-600">المستخدمين النشطين</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">استخدام النقاط</h3>
          <div className="h-80">
            {usageData.length > 0 ? (
              <UsageChart data={usageData} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                لا توجد بيانات متاحة
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">المبيعات</h3>
          <div className="h-80">
            {revenueData.length > 0 ? (
              <RevenueChart data={revenueData} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                لا توجد بيانات متاحة
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}