import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  MessageSquare, 
  ShoppingBag, 
  Calendar,
  CreditCard,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { Customer } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';

interface CustomerManagementTabProps {
  customers: Customer[];
}

export const CustomerManagementTab: React.FC<CustomerManagementTabProps> = ({ customers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'spent' | 'orders' | 'name'>('spent');

  const totalSpentAll = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const totalOrdersAll = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
  const avgSpent = customers.length > 0 ? Math.round(totalSpentAll / customers.length) : 0;

  const filteredCustomers = customers
    .filter((c) => {
      const term = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        (c.address && c.address.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'spent') return (b.totalSpent || 0) - (a.totalSpent || 0);
      if (sortBy === 'orders') return (b.totalOrders || 0) - (a.totalOrders || 0);
      return a.name.localeCompare(b.name);
    });

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const num = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const msg = `Halo Bapak/Ibu ${name}, salam hangat dari tim EcoAgro Store. Ada yang bisa kami bantu mengenai kebutuhan sarana tani Anda?`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-gray-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Total Pelanggan Terdata
            </span>
            <div className="text-2xl font-black text-gray-900 mt-1">{customers.length} Petani</div>
            <p className="text-[10px] text-gray-400 mt-0.5">Database pembeli toko & web</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#D8F3DC] text-[#1B4332] flex items-center justify-center font-bold">
            <Users className="w-6 h-6 text-[#2D6A4F]" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Total Akumulasi Belanja
            </span>
            <div className="text-2xl font-black text-[#1B4332] mt-1">{formatRupiah(totalSpentAll)}</div>
            <p className="text-[10px] text-gray-400 mt-0.5">Dari {totalOrdersAll} total transaksi</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6 text-[#D97706]" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Rata-rata Belanja / Petani
            </span>
            <div className="text-2xl font-black text-emerald-800 mt-1">{formatRupiah(avgSpent)}</div>
            <p className="text-[10px] text-gray-400 mt-0.5">Nilai per pelanggan</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#D8F3DC] text-[#1B4332] flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6 text-[#2D6A4F]" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs font-bold text-gray-700">
            Daftar Pelanggan ({filteredCustomers.length} Ditampilkan)
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium shrink-0">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'spent' | 'orders' | 'name')}
              className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none"
            >
              <option value="spent">Total Belanja Terbanyak</option>
              <option value="orders">Frekuensi Order Terbanyak</option>
              <option value="name">Nama Petani (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nama petani, nomor WhatsApp, atau alamat pengiriman..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-4">Nomor WhatsApp</th>
                <th className="py-3 px-4">Alamat Wilayah</th>
                <th className="py-3 px-4 text-center">Frekuensi Belanja</th>
                <th className="py-3 px-4 text-right">Total Akumulasi</th>
                <th className="py-3 px-4 text-right">Hubungi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Tidak ada data pelanggan yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Name */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-extrabold text-gray-900">{cust.name}</div>
                      {cust.lastOrderDate && (
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>Order terakhir: {formatDateIndo(cust.lastOrderDate)}</span>
                        </div>
                      )}
                    </td>

                    {/* WhatsApp */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-emerald-800 font-bold">
                      {cust.phone}
                    </td>

                    {/* Address */}
                    <td className="py-3 px-4 max-w-xs text-gray-600 truncate">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{cust.address || '-'}</span>
                      </div>
                    </td>

                    {/* Orders count */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-black text-gray-800 bg-gray-100 px-2.5 py-0.5 rounded-full text-[11px]">
                        <ShoppingBag className="w-3 h-3 text-emerald-700" />
                        {cust.totalOrders || 0}x Order
                      </span>
                    </td>

                    {/* Total spent */}
                    <td className="py-3 px-4 text-right whitespace-nowrap font-black text-emerald-800 text-xs sm:text-sm">
                      {formatRupiah(cust.totalSpent || 0)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openWhatsApp(cust.phone, cust.name)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#4A3E31] hover:bg-[#32281E] text-white rounded-xl text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3 text-[#FEF3C7]" />
                        <span>Chat WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
