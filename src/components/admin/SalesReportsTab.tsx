import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  CheckCircle, 
  Clock, 
  Printer, 
  Award, 
  Package, 
  BarChart3 
} from 'lucide-react';
import { Order, Product, Customer } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';

interface SalesReportsTabProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
}

export const SalesReportsTab: React.FC<SalesReportsTabProps> = ({
  orders,
  products,
  customers,
}) => {
  // Aggregate Metrics
  const totalAllRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const verifiedRevenue = orders
    .filter((o) => ['processing', 'shipped', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const completedOrdersCount = orders.filter((o) =>
    ['processing', 'shipped', 'completed'].includes(o.status)
  ).length;

  const averageOrderValue =
    completedOrdersCount > 0 ? Math.round(verifiedRevenue / completedOrdersCount) : 0;

  // Breakdown by Category
  const categorySalesMap: Record<string, { count: number; revenue: number }> = {
    'Benih & Bibit Unggul': { count: 0, revenue: 0 },
    'Pupuk, Nutrisi & Hayati': { count: 0, revenue: 0 },
    'Pestisida & Proteksi Tanaman': { count: 0, revenue: 0 },
    'Alat, Mesin & Perlengkapan Tani': { count: 0, revenue: 0 },
    'Irigasi & Greenhouse': { count: 0, revenue: 0 },
    'Ternak, Wadah & Pasca Panen': { count: 0, revenue: 0 },
  };

  orders
    .filter((o) => o.status !== 'cancelled')
    .forEach((ord) => {
      ord.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const cat = prod?.category || 'Benih & Bibit Unggul';
        if (!categorySalesMap[cat]) {
          categorySalesMap[cat] = { count: 0, revenue: 0 };
        }
        categorySalesMap[cat].count += item.quantity;
        categorySalesMap[cat].revenue += item.subtotal;
      });
    });

  const totalCatRevenue = Object.values(categorySalesMap).reduce(
    (sum, val) => sum + val.revenue,
    0
  ) || 1;

  // Top products by sold
  const topProducts = [...products]
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header with Export / Print button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            Laporan Kinerja & Analisis Sales Toko Pertanian
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Data real-time dihitung langsung dari seluruh transaksi pesanan di database Firestore
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Laporan Lengkap</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omzet */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">Omzet Terverifikasi</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800">
            {formatRupiah(verifiedRevenue)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Total bruto pesanan: {formatRupiah(totalAllRevenue)}
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">Transaksi Disetujui</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">
            {completedOrdersCount} Pesanan
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Dari total {orders.length} pesanan masuk
          </div>
        </div>

        {/* Pelanggan Aktif */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">Total Pelanggan Petani</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">
            {customers.length} Petani
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Tersimpan di direktori database
          </div>
        </div>

        {/* Rata-rata Keranjang (AOV) */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">Rata-rata Nilai Order</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-900">
            {formatRupiah(averageOrderValue)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Nilai rata-rata per transaksi sukses
          </div>
        </div>
      </div>

      {/* Grid: Category Breakdown & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Contribution */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900">
            Kontribusi Penjualan per Kategori Produk
          </h3>

          <div className="space-y-4 pt-1">
            {Object.entries(categorySalesMap).map(([catName, stats]) => {
              const percentage = Math.round((stats.revenue / totalCatRevenue) * 100);
              const getCatColor = (cat: string) => {
                switch (cat) {
                  case 'Benih & Bibit Unggul': return 'bg-[#F59E0B]';
                  case 'Pupuk, Nutrisi & Hayati': return 'bg-[#2D6A4F]';
                  case 'Pestisida & Proteksi Tanaman': return 'bg-[#EA580C]';
                  case 'Alat, Mesin & Perlengkapan Tani': return 'bg-[#8B5E3C]';
                  case 'Irigasi & Greenhouse': return 'bg-[#0D9488]';
                  case 'Ternak, Wadah & Pasca Panen': return 'bg-[#D97706]';
                  default: return 'bg-[#2D6A4F]';
                }
              };
              const colorClass = getCatColor(catName);

              return (
                <div key={catName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800">{catName}</span>
                    <span className="font-black text-emerald-800">
                      {formatRupiah(stats.revenue)} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 text-right">
                    Total {stats.count} unit terjual
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Products */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
          <h3 className="font-bold text-sm text-gray-900 flex items-center justify-between">
            <span>5 Produk Terlaris (Paling Banyak Diminati)</span>
            <Award className="w-4 h-4 text-amber-500" />
          </h3>

          <div className="space-y-2.5 pt-1">
            {topProducts.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-gray-900 truncate">{p.name}</div>
                    <div className="text-[10px] text-gray-400">{p.category} • {formatRupiah(p.price)}</div>
                  </div>
                </div>

                <div className="text-right whitespace-nowrap pl-2">
                  <div className="text-xs font-black text-emerald-800">{p.soldCount} Terjual</div>
                  <div className="text-[10px] text-gray-400">Stok: {p.stock}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
            Riwayat 5 Transaksi Penjualan Terbaru
          </h3>
        </div>

        <div className="divide-y divide-gray-100 text-xs">
          {orders.slice(0, 5).map((ord) => (
            <div key={ord.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50">
              <div>
                <div className="font-bold text-gray-900">{ord.orderNumber} - {ord.customerName}</div>
                <div className="text-[11px] text-gray-400">
                  {ord.items.length} macam barang • {formatDateIndo(ord.createdAt)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-emerald-800">{formatRupiah(ord.totalAmount)}</div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">
                  {ord.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
