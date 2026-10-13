import React, { useState } from 'react';
import { Users, Search, MessageSquare, ShoppingBag, MapPin, Calendar, ArrowUpDown } from 'lucide-react';
import { Customer } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';

interface CustomerManagementTabProps {
  customers: Customer[];
}

export const CustomerManagementTab: React.FC<CustomerManagementTabProps> = ({ customers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'spent' | 'orders' | 'name'>('spent');

  const filteredCustomers = customers
    .filter((c) => {
      const term = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.address.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
      if (sortBy === 'orders') return b.totalOrders - a.totalOrders;
      return a.name.localeCompare(b.name);
    });

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const num = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const msg = encodeURIComponent(
      `Halo Bapak/Ibu ${name}, terima kasih telah menjadi pelanggan setia EcoAgro Store. Ada yang bisa kami bantu seputar kebutuhan sarana pertanian Anda?`
    );
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Search and summary */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari nama petani, nomor HP, atau alamat wilayah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Urutkan:</span>
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

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>Direktori Pelanggan ({customers.length} Petani Terdata)</span>
          </div>
          <div className="text-[11px] text-gray-400">
            Terakumulasi otomatis dari setiap pesanan yang masuk
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-4">Nomor WhatsApp</th>
                <th className="py-3 px-4">Alamat Pengiriman</th>
                <th className="py-3 px-4 text-center">Total Order</th>
                <th className="py-3 px-4 text-right">Akumulasi Belanja</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Belum ada data pelanggan yang tersimpan. Pelanggan akan otomatis tercatat saat membuat pesanan.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Name */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-extrabold text-gray-900">{cust.name}</div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>Order terakhir: {formatDateIndo(cust.lastOrderDate)}</span>
                      </div>
                    </td>

                    {/* WhatsApp */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-emerald-800 font-bold">
                      {cust.phone}
                    </td>

                    {/* Address */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-1 text-[11px] text-gray-600 max-w-sm">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{cust.address}</span>
                      </div>
                    </td>

                    {/* Orders count */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full text-[11px]">
                        <ShoppingBag className="w-3 h-3 text-emerald-700" />
                        {cust.totalOrders}x Transaksi
                      </span>
                    </td>

                    {/* Total spent */}
                    <td className="py-3 px-4 text-right whitespace-nowrap font-black text-emerald-800 text-xs sm:text-sm">
                      {formatRupiah(cust.totalSpent)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openWhatsApp(cust.phone, cust.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat WA</span>
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
