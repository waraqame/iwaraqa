import { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';

export function AdminPayments() {
  const [searchTerm, setSearchTerm] = useState('');

  const mockPayments = [
    {
      id: 1,
      user: 'أحمد محمد',
      amount: 100,
      date: '2024/02/01',
      status: 'مكتمل',
      package: '13 مشروع',
    },
    // Add more mock payments...
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">المدفوعات والاشتراكات</h1>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          <Download size={20} />
          <span>تصدير التقرير</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="بحث في المدفوعات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          <Filter size={20} />
          <span>تصفية</span>
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">رقم العملية</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">المستخدم</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">المبلغ</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الباقة</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">التاريخ</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-600">#{payment.id}</td>
                <td className="px-6 py-4">{payment.user}</td>
                <td className="px-6 py-4">{payment.amount} ريال</td>
                <td className="px-6 py-4">{payment.package}</td>
                <td className="px-6 py-4 text-gray-600">{payment.date}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}