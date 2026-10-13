import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  Package, 
  Warehouse, 
  Calendar, 
  Percent, 
  ChevronRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Order, Product, Customer } from '../../types';
import { formatRupiah, formatDateIndo, AUTO_DISCOUNT_THRESHOLD } from '../../utils/formatters';

interface AdminOverviewTabProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  onNavigateTab: (tabId: 'orders' | 'products' | 'inventory' | 'customers' | 'reports') => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  orders,
  products,
  customers,
  onNavigateTab,
}) => {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentMonthStr = now.toISOString().slice(0, 7);

  // Penjualan Harian & Bulanan
  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  
  const todayOrders = validOrders.filter((o) => o.createdAt.startsWith(todayStr));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const monthOrders = validOrders.filter((o) => o.createdAt.startsWith(currentMonthStr));
  const monthRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const totalAllRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Pesanan baru yang butuh tindakan (pending & proof_submitted)
  const pendingOrders = orders.filter((o) => o.status === 'pending_payment' || o.status === 'proof_submitted');
  const proofSubmittedOrders = orders.filter((o) => o.status === 'proof_submitted');

  // Stok Kritis
  const criticalStockProducts = products.filter((p) => p.stock <= (p.minStockAlert || 10));

  // Analisis Sistem Diskon 10% Min 1 Juta
  const discountedOrders = orders.filter((o) => (o.discountAmount || 0) > 0);
  const totalDiscountGiven = orders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
  const autoDiscountEligibleCount = orders.filter((o) => (o.subtotalAmount || 0) >= AUTO_DISCOUNT_THRESHOLD).length;

  // Revenue 7 Hari Terakhir untuk Mini Chart
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
    const dayOrders = validOrders.filter((o) => o.createdAt.startsWith(dateStr));
    const revenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      date: dateStr,
      label: dayName,
      revenue,
      orderCount: dayOrders.length,
    };
  });

  const maxDailyRevenue = Math.max(...last7DaysData.map((d) => d.revenue), 500000);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1B4332] via-[#24523B] to-[#5C3D2E] rounded-3xl p-6 text-white shadow-md border border-[#74C69D]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7]/20 border border-[#FDE68A]/30 text-[#FDE68A] text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role: Admin Eco (Pengelola Toko EcoAgro)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Dashboard Utama & Operasional Pertanian
          </h2>
          <p className="text-xs sm:text-sm text-[#D8F3DC]/80 mt-1 max-w-xl">
            Ringkasan penjualan real-time, grafik arus kas, pemantauan stok minimum pergudangan, antrean verifikasi pembayaran, dan performa program promo diskon 10%.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {proofSubmittedOrders.length > 0 && (
            <button
              onClick={() => onNavigateTab('orders')}
              className="px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#78350F] rounded-2xl text-xs font-black shadow-md cursor-pointer flex items-center gap-2 animate-pulse"
            >
              <Clock className="w-4 h-4" />
              <span>{proofSubmittedOrders.length} Bukti Bayar Butuh Approval</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Penjualan Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DEC8] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#78350F]">
            <span className="font-bold">Penjualan Hari Ini</span>
            <div className="p-2 rounded-xl bg-[#D8F3DC] text-[#1B4332]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black text-[#1B4332]">
              {formatRupiah(todayRevenue)}
            </div>
            <div className="text-xs text-[#78350F]/70 mt-1 flex items-center gap-1">
              <span className="font-bold text-[#2D6A4F]">{todayOrders.length} transaksi</span>
              <span>tercatat hari ini</span>
            </div>
          </div>
        </div>

        {/* Penjualan Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DEC8] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#78350F]">
            <span className="font-bold">Penjualan Bulan Ini</span>
            <div className="p-2 rounded-xl bg-[#FEF3C7] text-[#92400E]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black text-[#1B4332]">
              {formatRupiah(monthRevenue)}
            </div>
            <div className="text-xs text-[#78350F]/70 mt-1 flex items-center gap-1">
              <span className="font-bold text-[#92400E]">{monthOrders.length} transaksi</span>
              <span>dalam 30 hari</span>
            </div>
          </div>
        </div>

        {/* Stok Produk Kritis */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-5 rounded-2xl border border-[#E8DEC8] shadow-2xs cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#78350F]">
            <span className="font-bold">Stok Kritis (&le; 10)</span>
            <div className={`p-2 rounded-xl ${criticalStockProducts.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-xl font-black ${criticalStockProducts.length > 0 ? 'text-amber-700' : 'text-[#1B4332]'}`}>
              {criticalStockProducts.length} Produk
            </div>
            <div className="text-xs text-[#78350F]/70 mt-1 flex items-center justify-between">
              <span>{criticalStockProducts.length > 0 ? 'Perlu restock supplier' : 'Seluruh stok aman'}</span>
              <span className="text-[#2D6A4F] font-bold flex items-center gap-0.5">
                Lihat <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Pesanan Perlu Diproses */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-5 rounded-2xl border border-[#E8DEC8] shadow-2xs cursor-pointer hover:border-emerald-500 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#78350F]">
            <span className="font-bold">Pesanan Butuh Tindakan</span>
            <div className="p-2 rounded-xl bg-[#D8F3DC] text-[#1B4332]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black text-[#1B4332]">
              {pendingOrders.length} Pesanan
            </div>
            <div className="text-xs text-[#78350F]/70 mt-1 flex items-center justify-between">
              <span>{proofSubmittedOrders.length} menunggu konfirmasi bayar</span>
              <span className="text-[#2D6A4F] font-bold flex items-center gap-0.5">
                Proses <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sesi Penjelasan Khusus: Sistem Diskon Otomatis 10% Minimal 1 Juta */}
      <div className="bg-gradient-to-br from-[#FEF3C7] via-white to-[#F0FFF4] rounded-3xl p-6 border-2 border-[#F59E0B]/50 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#E8DEC8]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D97706] text-white flex items-center justify-center shadow-sm">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#78350F]">
                  Sistem Diskon Otomatis 10% (Belanja Minimal Rp 1.000.000)
                </h3>
                <span className="px-2 py-0.5 bg-[#2D6A4F] text-white text-[10px] font-extrabold rounded-full">
                  AKTIF DI WEBSTORE
                </span>
              </div>
              <p className="text-xs text-[#78350F]/80 mt-0.5">
                Fitur diskon cerdas untuk memicu pembelian borongan sarana pertanian oleh petani & kelompok tani
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/90 px-4 py-2 rounded-2xl border border-[#FDE68A] text-xs">
            <span className="text-[#78350F] font-bold">Total Penghematan Diberikan:</span>
            <span className="font-black text-[#1B4332] text-sm">{formatRupiah(totalDiscountGiven)}</span>
          </div>
        </div>

        {/* 3 Detail Penjelasan Mekanisme Sistem Diskon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/90 p-4 rounded-2xl border border-[#E8DEC8] text-xs space-y-2">
            <div className="font-extrabold text-[#1B4332] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
              <span>1. Aturan Ambang Batas (Threshold)</span>
            </div>
            <p className="text-[#78350F]/80 leading-relaxed text-[11px]">
              Setiap kali pembeli menaruh produk ke keranjang hingga subtotal mencapai <b>Rp 1.000.000</b> atau lebih, sistem otomatis memotong <b>10%</b> secara instan tanpa perlu memasukkan kode kupon promo manual.
            </p>
          </div>

          <div className="bg-white/90 p-4 rounded-2xl border border-[#E8DEC8] text-xs space-y-2">
            <div className="font-extrabold text-[#1B4332] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
              <span>2. Transparansi di Nota & Database</span>
            </div>
            <p className="text-[#78350F]/80 leading-relaxed text-[11px]">
              Nilai potongan dicatat terpisah ke field Firestore (<code>discountAmount</code> dan <code>discountReason: "Diskon Otomatis 10% (Belanja Min 1 Juta)"</code>) sehingga laporan omzet toko dan nota invoice tetap akurat.
            </p>
          </div>

          <div className="bg-white/90 p-4 rounded-2xl border border-[#E8DEC8] text-xs space-y-2">
            <div className="font-extrabold text-[#1B4332] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
              <span>3. Dampak Penjualan Nyata</span>
            </div>
            <p className="text-[#78350F]/80 leading-relaxed text-[11px]">
              Dari seluruh pesanan, tercatat <b>{autoDiscountEligibleCount} pesanan</b> yang berhasil memanfaatkan diskon ini. Program ini terbukti meningkatkan ukuran keranjang belanja (Average Order Value) petani.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Grafik Pendapatan 7 Hari & Produk Stok Kritis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Pendapatan 7 Hari Terakhir (CSS Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#E8DEC8] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm sm:text-base text-[#1B4332] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#2D6A4F]" />
                Grafik Pendapatan 7 Hari Terakhir
              </h3>
              <p className="text-xs text-[#78350F]/70 mt-0.5">
                Tren omzet harian berdasarkan pesanan masuk yang terverifikasi
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-bold text-[#2D6A4F] hover:underline flex items-center gap-1"
            >
              Laporan Lengkap <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-6 pb-2">
            <div className="h-48 flex items-end gap-2 sm:gap-4 justify-between border-b border-[#E8DEC8] pb-2">
              {last7DaysData.map((day, idx) => {
                const heightPercent = maxDailyRevenue > 0 ? Math.max(10, Math.round((day.revenue / maxDailyRevenue) * 100)) : 10;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-[#1B4332] text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-md pointer-events-none whitespace-nowrap z-20">
                      <div>{formatRupiah(day.revenue)}</div>
                      <div className="text-[9px] text-[#D8F3DC]">{day.orderCount} pesanan</div>
                    </div>

                    {/* Bar */}
                    <div className="w-full bg-[#FAF8F5] rounded-t-xl h-full flex items-end justify-center overflow-hidden">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-10 bg-gradient-to-t from-[#1B4332] to-[#52B788] rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                      />
                    </div>

                    {/* Day Label */}
                    <span className="text-[11px] font-bold text-[#78350F]/80">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daftar Stok Produk Kritis */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8DEC8] shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-sm sm:text-base text-[#1B4332] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Stok Kritis Menipis
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                {criticalStockProducts.length} Item
              </span>
            </div>
            <p className="text-xs text-[#78350F]/70 mb-4">
              Produk dengan sisa stok di bawah batas aman (&le; 10 unit)
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {criticalStockProducts.length === 0 ? (
                <div className="p-4 bg-[#D8F3DC]/40 rounded-2xl text-center text-xs text-[#2D6A4F] font-bold border border-[#B7E4C7]">
                  Seluruh stok produk berada dalam batas aman (&gt; 10 unit).
                </div>
              ) : (
                criticalStockProducts.slice(0, 5).map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E8DEC8] text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-bold text-[#1B4332] truncate">{prod.name}</div>
                      <div className="text-[10px] text-[#78350F]/70">{prod.category}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-black text-xs">
                        Sisa {prod.stock} {prod.unit}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="w-full mt-4 py-2.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Warehouse className="w-4 h-4" />
            <span>Buka Manajemen Gudang & Restock</span>
          </button>
        </div>
      </div>

      {/* Pesanan Baru Perlu Diproses (Antrean Approval) */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8DEC8] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-sm sm:text-base text-[#1B4332] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#2D6A4F]" />
              Pesanan Masuk Perlu Diproses ({pendingOrders.length})
            </h3>
            <p className="text-xs text-[#78350F]/70 mt-0.5">
              Pesanan dengan bukti bayar yang menunggu approval atau butuh konfirmasi toko
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#EAE0D0] text-[#1B4332] rounded-xl text-xs font-bold border border-[#D5C7B0] transition-colors cursor-pointer"
          >
            Buka Seluruh Riwayat Pesanan &rarr;
          </button>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#78350F]/70 bg-[#FAF8F5] rounded-2xl border border-[#E8DEC8]">
            <CheckCircle2 className="w-8 h-8 text-[#2D6A4F] mx-auto mb-2" />
            Tidak ada antrean pesanan baru. Seluruh pesanan telah diproses atau terverifikasi!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DEC8] text-[#78350F] font-bold">
                  <th className="pb-3">No. Pesanan</th>
                  <th className="pb-3">Nama Pembeli</th>
                  <th className="pb-3">Total Belanja</th>
                  <th className="pb-3">Metode Bayar</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DEC8]/60">
                {pendingOrders.slice(0, 6).map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 font-mono font-bold text-[#1B4332]">{order.orderNumber}</td>
                    <td className="py-3 font-semibold text-[#2D2A26]">{order.customerName}</td>
                    <td className="py-3 font-bold text-[#1B4332]">{formatRupiah(order.totalAmount)}</td>
                    <td className="py-3 uppercase text-[11px] font-bold text-[#78350F]">
                      {order.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3">
                      {order.status === 'proof_submitted' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] animate-pulse">
                          Bukti Diunggah (Perlu Approval)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                          Menunggu Bayar
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onNavigateTab('orders')}
                        className="px-3 py-1 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Verifikasi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
