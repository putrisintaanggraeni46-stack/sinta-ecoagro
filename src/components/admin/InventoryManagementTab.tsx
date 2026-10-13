import React, { useState } from 'react';
import { 
  Warehouse, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Search, 
  Building2, 
  FileSpreadsheet, 
  Loader2,
  Calendar,
  Layers
} from 'lucide-react';
import { Product, StockMutation } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';

interface InventoryManagementTabProps {
  products: Product[];
  mutations: StockMutation[];
  onAddSupplierStock: (productId: string, productName: string, qty: number, supplier: string, notes?: string) => Promise<void>;
  onAdjustStock: (productId: string, productName: string, targetStock: number, reason: string) => Promise<void>;
}

export const InventoryManagementTab: React.FC<InventoryManagementTabProps> = ({
  products,
  mutations,
  onAddSupplierStock,
  onAdjustStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for supplier restock
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [supplierName, setSupplierName] = useState('PT Petrokimia Kayaku / CV Pupuk Agro Nusantara');
  const [inflowQty, setInflowQty] = useState<number>(50);
  const [inflowNotes, setInflowNotes] = useState('Surat Jalan No. SJ-2026/AGRO/091');

  // Form states for stock opname adjustment
  const [opnameProductId, setOpnameProductId] = useState(products[0]?.id || '');
  const [actualPhysicalStock, setActualPhysicalStock] = useState<number>(10);
  const [opnameReason, setOpnameReason] = useState('Hasil Opname Fisik Rutin Bulanan Gudang');

  // Critical low stock items
  const lowStockProducts = products.filter((p) => p.stock <= (p.minStockAlert || 10));

  // Total warehouse valuation
  const totalValuation = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const filteredMutations = mutations.filter((m) => {
    const matchesSearch =
      m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.supplierName && m.supplierName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod || inflowQty <= 0) return;

    try {
      setIsSubmitting(true);
      await onAddSupplierStock(
        prod.id,
        prod.name,
        Number(inflowQty),
        supplierName.trim(),
        inflowNotes.trim()
      );
      setIsSupplierModalOpen(false);
      setInflowQty(50);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpnameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === opnameProductId);
    if (!prod) return;

    try {
      setIsSubmitting(true);
      await onAdjustStock(
        prod.id,
        prod.name,
        Number(actualPhysicalStock),
        opnameReason.trim()
      );
      setIsOpnameModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openQuickRestock = (product: Product) => {
    setSelectedProductId(product.id);
    setInflowQty(50);
    setIsSupplierModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SKUs */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">Total Item Terdaftar</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{products.length} SKU</div>
          <div className="text-[11px] text-gray-400 mt-1">Katalog perlengkapan tani aktif</div>
        </div>

        {/* Critical Stock Alert */}
        <div className="bg-white p-4.5 rounded-2xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-amber-800 mb-2">
            <span className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Stok Kritis (&le; 10 Unit)
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-800">{lowStockProducts.length} Produk</div>
          <div className="text-[11px] text-amber-600 mt-1">Perlu segera restock dari supplier</div>
        </div>

        {/* Total Mutations */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">Riwayat Mutasi Tercatat</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-900">{mutations.length} Transaksi</div>
          <div className="text-[11px] text-gray-400 mt-1">Masuk, keluar & penyesuaian</div>
        </div>

        {/* Total Valuation */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">Nilai Aset Stok Gudang</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-purple-900">{formatRupiah(totalValuation)}</div>
          <div className="text-[11px] text-gray-400 mt-1">Total valuasi barang di gudang</div>
        </div>
      </div>

      {/* Low Stock Warning Section (Fitur Stok Minimum) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-amber-950">
                  Peringatan Otomatis: {lowStockProducts.length} Produk Mencapai Batas Minimum!
                </h3>
                <p className="text-[11px] text-amber-800">
                  Pupuk, benih, atau alat berikut tersisa kurang dari 10 unit. Klik tombol restock untuk mencatat stok masuk.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="p-3 bg-white rounded-2xl border border-amber-200/80 flex items-center justify-between gap-2 shadow-2xs">
                <div className="min-w-0">
                  <div className="font-bold text-xs text-gray-900 truncate">{p.name}</div>
                  <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                    Sisa Stok: <span className="text-rose-600 font-black">{p.stock}</span> {p.unit}
                  </div>
                </div>
                <button
                  onClick={() => openQuickRestock(p)}
                  className="px-2.5 py-1.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-[10px] font-bold shrink-0 cursor-pointer transition-colors"
                >
                  + Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Bar for Inventory Operations */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-56 flex-1">
            <input
              type="text"
              placeholder="Cari mutasi produk, supplier, atau alasan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-1.5">
            {['all', 'in', 'out', 'adjustment'].map((tp) => (
              <button
                key={tp}
                onClick={() => setFilterType(tp)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  filterType === tp
                    ? 'bg-[#1B4332] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tp === 'all' ? 'Semua Mutasi' : tp === 'in' ? 'Stok Masuk' : tp === 'out' ? 'Stok Keluar' : 'Penyesuaian'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpnameModalOpen(true)}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
            <span>Stock Opname Fisik</span>
          </button>

          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Stok Masuk Supplier</span>
          </button>
        </div>
      </div>

      {/* Stock Mutation History Table */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2D6A4F]" />
            <span>Riwayat Mutasi & Kartu Stok ({filteredMutations.length} Catatan)</span>
          </div>
          <div className="text-[11px] text-gray-400">
            Mencatat otomatis stok keluar pesanan dan stok masuk supplier
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">Tipe Mutasi</th>
                <th className="py-3 px-4 text-center">Jumlah</th>
                <th className="py-3 px-4 text-center">Stok Awal &rarr; Akhir</th>
                <th className="py-3 px-4">Keterangan / Supplier / Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMutations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Belum ada riwayat mutasi stok. Stok keluar otomatis tercatat saat pesanan dibuat, dan stok masuk tercatat dari form supplier.
                  </td>
                </tr>
              ) : (
                filteredMutations.map((m) => {
                  const isIn = m.type === 'in';
                  const isOut = m.type === 'out';

                  return (
                    <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                        {formatDateIndo(m.createdAt)}
                      </td>

                      <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                        {m.productName}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isIn
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isOut
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {isIn ? (
                            <>
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                              Stok Masuk
                            </>
                          ) : isOut ? (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-rose-600" />
                              Stok Keluar
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3 text-blue-600" />
                              Penyesuaian
                            </>
                          )}
                        </span>
                      </td>

                      <td className={`py-3 px-4 text-center font-black whitespace-nowrap text-xs ${
                        isIn ? 'text-emerald-700' : isOut ? 'text-rose-700' : 'text-blue-700'
                      }`}>
                        {isIn ? `+${m.quantity}` : isOut ? `-${m.quantity}` : m.quantity}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap font-mono text-gray-600 text-[11px]">
                        {m.previousStock} &rarr; <b className="text-gray-900">{m.newStock}</b>
                      </td>

                      <td className="py-3 px-4 text-gray-600 text-[11px]">
                        <div>{m.reason}</div>
                        {m.supplierName && (
                          <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                            Supplier: {m.supplierName}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Inflow Restock Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E8DEC8] my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">Pencatatan Stok Masuk Supplier</h3>
                <p className="text-xs text-[#D8F3DC]">Tambahkan stok barang yang dikirim oleh distributor / pabrik</p>
              </div>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSupplierSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pilih Produk Pertanian <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok Saat Ini: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Jumlah Masuk (Unit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={inflowQty}
                    onChange={(e) => setInflowQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Supplier / Pabrikan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Contoh: PT Petrokimia Gresik"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Catatan / No. Surat Jalan / Faktur Supplier
                </label>
                <input
                  type="text"
                  value={inflowNotes}
                  onChange={(e) => setInflowNotes(e.target.value)}
                  placeholder="Contoh: No. SJ-2026/089 / Pengiriman Truk Armada 2"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Simpan Stok Masuk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Opname Adjustment Modal */}
      {isOpnameModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E8DEC8] my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">Penyesuaian Fisik / Stock Opname</h3>
                <p className="text-xs text-gray-300">Sesuaikan jumlah stok sistem dengan hasil hitung fisik di gudang</p>
              </div>
              <button
                onClick={() => setIsOpnameModalOpen(false)}
                className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOpnameSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pilih Produk Pertanian <span className="text-rose-500">*</span>
                </label>
                <select
                  value={opnameProductId}
                  onChange={(e) => {
                    setOpnameProductId(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod) setActualPhysicalStock(prod.stock);
                  }}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok Saat Ini: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Jumlah Stok Fisik Aktual di Gudang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={actualPhysicalStock}
                  onChange={(e) => setActualPhysicalStock(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Alasan Penyesuaian / Keterangan Opname <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={opnameReason}
                  onChange={(e) => setOpnameReason(e.target.value)}
                  placeholder="Contoh: Selisih fisik kemasan bocor / rusak / opname akhir bulan"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOpnameModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Simpan Penyesuaian Opname</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
