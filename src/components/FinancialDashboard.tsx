import React, { useMemo } from 'react';
import { CompletedOrder, Product, DailySummary } from '../types';
import { BarChart, Receipt, TrendingUp } from 'lucide-react';

interface FinancialDashboardProps {
  completedOrders: CompletedOrder[];
  products: Product[];
}

export function FinancialDashboard({ completedOrders, products }: FinancialDashboardProps) {
  const dailySummaries = useMemo(() => {
    const summariesMap = new Map<string, DailySummary>();

    completedOrders.forEach(order => {
      const date = new Date(order.timestamp).toLocaleDateString();
      const existing = summariesMap.get(date) || {
        date,
        totalSales: 0,
        orderCount: 0,
        topProducts: []
      };

      // Update daily totals
      existing.totalSales += order.total;
      existing.orderCount += 1;

      // Track product sales
      order.items.forEach(item => {
        const productTotal = item.product.price * item.quantity;
        const productIndex = existing.topProducts.findIndex(p => p.productId === item.product.id);

        if (productIndex >= 0) {
          existing.topProducts[productIndex].quantity += item.quantity;
          existing.topProducts[productIndex].total += productTotal;
        } else {
          existing.topProducts.push({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            total: productTotal
          });
        }
      });

      // Sort and limit top products
      existing.topProducts.sort((a, b) => b.total - a.total);
      existing.topProducts = existing.topProducts.slice(0, 5);

      summariesMap.set(date, existing);
    });

    return Array.from(summariesMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [completedOrders]);

  const totalRevenue = useMemo(() => 
    completedOrders.reduce((sum, order) => sum + order.total, 0)
  , [completedOrders]);

  const averageOrderValue = useMemo(() => 
    completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
  , [completedOrders, totalRevenue]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">Daily Sales Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Orders</th>
                  <th className="text-left py-2">Total Sales</th>
                  <th className="text-left py-2">Top Products</th>
                </tr>
              </thead>
              <tbody>
                {dailySummaries.map((summary) => (
                  <tr key={summary.date} className="border-b">
                    <td className="py-3">{summary.date}</td>
                    <td className="py-3">{summary.orderCount}</td>
                    <td className="py-3">₺{summary.totalSales.toFixed(2)}</td>
                    <td className="py-3">
                      <div className="space-y-1">
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

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Table</th>
                  <th className="text-left py-2">Items</th>
                  <th className="text-left py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {completedOrders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b">
                    {/* Tarih Sütunu */}
                    <td className="py-3">
                      {new Date(order.timestamp).toLocaleDateString('tr-TR')} {/* Örnek: 29.03.2025 */}
                    </td>
                    {/* Saat Sütunu */}
                    <td className="py-3">
                      {new Date(order.timestamp).toLocaleTimeString('tr-TR')} {/* Örnek: 13:57:22 */}
                    </td>
                    {/* Masa Adı */}
                    <td className="py-3">{order.tableName}</td>
                    {/* Sipariş Detayları */}
                    <td className="py-3">
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.product.id} className="text-sm">
                            {item.quantity}x {item.product.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    {/* Toplam Tutar */}
                    <td className="py-3">₺{order.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}