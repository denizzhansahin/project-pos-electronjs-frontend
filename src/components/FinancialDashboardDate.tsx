// src/components/FinancialDashboard.tsx
import React, { useMemo } from 'react';
import { CompletedOrder, Product } from '../types'; // DailySummary'e gerek kalmadı
import { BarChart, Receipt, TrendingUp, Info } from 'lucide-react';

interface FinancialDashboardProps {
  completedOrders: CompletedOrder[];
  products: Product[]; // Ürün bilgisi hala gerekebilir (fallback için)
  selectedDate: Date | null;
  isLoading: boolean;
}

// Tip tanımı: DailySummary için kullanılacak iç yapı
interface CalculatedDailySummary {
  date: string; // Gösterim için formatlanmış tarih
  key: string; // Gruplama/sıralama için YYYY-MM-DD
  totalSales: number;
  orderCount: number;
  topProducts: {
    productId: string;
    name: string;
    quantity: number;
    total: number;
  }[];
}


const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// Bileşen adını FinancialDashboard olarak düzelt
export function FinancialDashboardDate({ completedOrders, products, selectedDate, isLoading }: FinancialDashboardProps) {

  const dailySummaries = useMemo(() => {
     const summariesMap = new Map<string, CalculatedDailySummary>(); // Tip kullandık

    completedOrders.forEach(order => {
      const orderDate = new Date(order.timestamp);
      const dateKey = orderDate.toISOString().split('T')[0];
      const displayDate = formatDateDisplay(orderDate);

      const existing = summariesMap.get(dateKey) || {
        date: displayDate,
        key: dateKey,
        totalSales: 0,
        orderCount: 0,
        topProducts: [] // Tip burada otomatik olarak atanır
      };

      existing.totalSales += order.total;
      existing.orderCount += 1;

      order.items.forEach(item => {
        // Backend'den gelen ürün bilgilerini önceliklendir, yoksa products listesinden ara
        const productName = item.product?.name ?? products.find(p => p.id === item.product.id)?.name ?? 'Unknown Product';
        // Backend'den gelen birim fiyatı kullan, yoksa güncel ürün fiyatını
        const pricePerUnit = item.product?.price ?? 0;
        const productTotal = pricePerUnit * item.quantity;
        const productId = item.product?.id ?? 'unknown'; // ID'yi garantile

        if(productId === 'unknown') return; // Geçersiz ürün ID'si varsa atla

        const productIndex = existing.topProducts.findIndex(p => p.productId === productId);

        if (productIndex >= 0) {
          existing.topProducts[productIndex].quantity += item.quantity;
          existing.topProducts[productIndex].total += productTotal;
        } else {
          existing.topProducts.push({
            productId: productId,
            name: productName,
            quantity: item.quantity,
            total: productTotal
          });
        }
      });

      existing.topProducts.sort((a, b) => b.total - a.total);
      summariesMap.set(dateKey, existing);
    });

    return Array.from(summariesMap.values()).sort((a, b) =>
      // new Date(b.key).getTime() - new Date(a.key).getTime() // Tarihe göre sıralama
      b.key.localeCompare(a.key) // String olarak sıralama daha güvenilir olabilir
    );
  }, [completedOrders, products]); // products bağımlılığını ekle

  const totalRevenue = useMemo(() =>
    completedOrders.reduce((sum, order) => sum + order.total, 0)
  , [completedOrders]);

  const averageOrderValue = useMemo(() =>
    completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
  , [completedOrders, totalRevenue]);


  const dashboardTitle = selectedDate
    ? `Financial Summary for ${formatDateDisplay(selectedDate)}`
    : 'Overall Financial Summary';

   if (isLoading) {
       return <div className="p-6 text-center text-gray-500">Loading financial data...</div>;
   }

   if (!isLoading && completedOrders.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">
                <Info size={32} className="mx-auto mb-2 opacity-50" />
                No completed orders found
                {selectedDate ? ` for ${formatDateDisplay(selectedDate)}` : ' yet'}.
            </div>
        );
    }

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-gray-800 mb-4">{dashboardTitle}</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* ... Kartlar aynı kalır ... */}
         <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">₺{totalRevenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>
         <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold">{completedOrders.length}</p>
            </div>
            <Receipt className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Order Value</p>
              <p className="text-2xl font-bold">₺{averageOrderValue.toFixed(2)}</p>
            </div>
            <BarChart className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Daily Summaries */}
      {dailySummaries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
            <h3 className="text-lg font-bold mb-4">
                {selectedDate ? 'Sales Summary' : 'Daily Sales Summary'}
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                    <tr className="border-b">
                    {!selectedDate && <th className="text-left py-2 px-3">Date</th>}
                    <th className="text-left py-2 px-3">Orders</th>
                    <th className="text-left py-2 px-3">Total Sales</th>
                    <th className="text-left py-2 px-3">Top Products (by Value)</th>
                    </tr>
                </thead>
                <tbody>
                    {dailySummaries.map((summary) => (
                    <tr key={summary.key} className="border-b last:border-b-0 hover:bg-gray-50">
                        {!selectedDate && <td className="py-3 px-3">{summary.date}</td>}
                        <td className="py-3 px-3">{summary.orderCount}</td>
                        <td className="py-3 px-3">₺{summary.totalSales.toFixed(2)}</td>
                        <td className="py-3 px-3">
                        <div className="space-y-1">
                             {summary.topProducts.length === 0 && <span className="text-xs text-gray-500">N/A</span>}
                             {summary.topProducts.slice(0, 3).map((product) => (
                            <div key={product.productId} className="text-sm">
                                {product.name} ({product.quantity}x) - ₺{product.total.toFixed(2)}
                            </div>
                            ))}
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        </div>
      )}

      {/* Recent Orders Table */}
       {completedOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
            <h3 className="text-lg font-bold mb-4">
                {selectedDate ? `Orders on ${formatDateDisplay(selectedDate)}` : 'Recent Orders'}
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                    <tr className="border-b">
                    <th className="text-left py-2 px-3">Time</th>
                    <th className="text-left py-2 px-3">Table</th>
                    <th className="text-left py-2 px-3">Items</th>
                    <th className="text-left py-2 px-3">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {completedOrders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 px-3">
                         {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-3">{order.tableName || '-'}</td>
                        <td className="py-3 px-3">
                        <div className="space-y-1">
                            {order.items.map((item) => (
                            <div key={item.id} className="text-sm"> {/* item.id kullanıldı */}
                                {item.quantity}x {item.product?.name ?? products.find(p => p.id === item.product.id)?.name ?? 'Unknown'}
                            </div>
                            ))}
                        </div>
                        </td>
                        <td className="py-3 px-3">₺{order.total.toFixed(2)}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        </div>
       )}

    </div>
  );
}