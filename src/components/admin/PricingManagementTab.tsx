import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Search, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  Save, 
  Edit3, 
  Layers, 
  CheckCircle2, 
  Loader2, 
  HelpCircle,
  ArrowRight,
  Filter,
  BarChart2
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { 
  getProductBuyPrice, 
  getProductProfitRatio, 
  calculateSellingPriceFromBuyPrice, 
  calculateBuyPriceFromSellingPrice, 
  calculateProfitMetrics, 
  CATEGORY_DEFAULT_MARKUP, 
  DEFAULT_STORE_MARKUP_PERCENT,
  getProductSku
} from '../../utils/pricingUtils';

interface PricingManagementTabProps {
  products: Product[];
  onSaveProduct: (product: Partial<Product> & { id?: string }) => Promise<string>;
  onBatchUpdatePricing: (updates: { id: string; price: number; buyPrice?: number; profitRatio?: number }[]) => Promise<void>;
}

export const PricingManagementTab: React.FC<PricingManagementTabProps> = ({
  products,
  onSaveProduct,
  onBatchUpdatePricing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<ProductCategory | 'Semua'>('Semua');
  const [globalMarkupInput, setGlobalMarkupInput] = useState<number>(25);
  const [isApplyingBatch, setIsApplyingBatch] = useState(false);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);

  // Edit single product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editBuyPrice, setEditBuyPrice] = useState<number>(0);
  const [editMarkupRatio, setEditMarkupRatio] = useState<number>(25);
  const [editSellingPrice, setEditSellingPrice] = useState<number>(0);
  const [isSavingSingle, setIsSavingSingle] = useState(false);

  // Interactive Simulator State
  const [simBuyPrice, setSimBuyPrice] = useState<number>(100000);
  const [simMarkupRatio, setSimMarkupRatio] = useState<number>(25);

  const categories: (ProductCategory | 'Semua')[] = [
    'Semua',
    'Benih & Bibit Unggul',
    'Pupuk, Nutrisi & Hayati',
    'Pestisida & Proteksi Tanaman',
    'Alat, Mesin & Perlengkapan Tani',
    'Irigasi & Greenhouse',
    'Ternak, Wadah & Pasca Panen',
  ];

  // Global KPIs
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);
  const totalCostValue = products.reduce((sum, p) => sum + getProductBuyPrice(p) * p.stock, 0);
  const totalSalesValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const totalPotentialProfit = Math.max(0, totalSalesValue - totalCostValue);
  const averageMarkup = products.length > 0
    ? Math.round((products.reduce((sum, p) => sum + getProductProfitRatio(p), 0) / products.length) * 10) / 10
    : 0;

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCat === 'Semua' || p.category === selectedCat;
      const sku = getProductSku(p);
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCat, searchTerm]);

  // Open Edit Product Modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    const buy = getProductBuyPrice(product);
    const ratio = getProductProfitRatio(product);
    setEditBuyPrice(buy);
    setEditMarkupRatio(ratio);
    setEditSellingPrice(product.price);
  };

  // Live Auto Ratio handlers in Modal
  const handleEditBuyPriceChange = (newBuy: number) => {
    setEditBuyPrice(newBuy);
    const autoSell = calculateSellingPriceFromBuyPrice(newBuy, editMarkupRatio);
    setEditSellingPrice(autoSell);
  };

  const handleEditMarkupRatioChange = (newRatio: number) => {
    setEditMarkupRatio(newRatio);
    const autoSell = calculateSellingPriceFromBuyPrice(editBuyPrice, newRatio);
    setEditSellingPrice(autoSell);
  };

  const handleEditSellingPriceChange = (newSell: number) => {
    setEditSellingPrice(newSell);
    if (editBuyPrice > 0) {
      const ratio = ((newSell - editBuyPrice) / editBuyPrice) * 100;
      setEditMarkupRatio(Math.round(ratio * 10) / 10);
    }
  };

  // Save Single Product Price
  const handleSaveSinglePrice = async () => {
    if (!editingProduct) return;
    try {
      setIsSavingSingle(true);
      await onSaveProduct({
        id: editingProduct.id,
        buyPrice: editBuyPrice,
        profitRatio: editMarkupRatio,
        price: editSellingPrice,
      });
      setEditingProduct(null);
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan pengaturan harga');
    } finally {
      setIsSavingSingle(false);
    }
  };

  // Batch Apply Markup to All or Category
  const handleBatchApplyMarkup = async (targetCategory?: ProductCategory) => {
    const targetProducts = targetCategory 
      ? products.filter(p => p.category === targetCategory)
      : (selectedCat !== 'Semua' ? products.filter(p => p.category === selectedCat) : products);

    if (targetProducts.length === 0) {
      alert('Tidak ada produk yang dipilih untuk pembaruan harga.');
      return;
    }

    const confirmMsg = targetCategory
      ? `Terapkan rasio profit standar kategori "${targetCategory}" ke ${targetProducts.length} produk?`
      : `Terapkan rasio profit ${globalMarkupInput}% ke ${targetProducts.length} produk ${selectedCat !== 'Semua' ? `kategori ${selectedCat}` : 'seluruh toko'}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setIsApplyingBatch(true);
      const updates = targetProducts.map((p) => {
        const ratio = targetCategory 
          ? (CATEGORY_DEFAULT_MARKUP[targetCategory] || globalMarkupInput)
          : globalMarkupInput;
        const buyPrice = getProductBuyPrice(p);
        const newSellPrice = calculateSellingPriceFromBuyPrice(buyPrice, ratio);
        return {
          id: p.id,
          buyPrice,
          profitRatio: ratio,
          price: newSellPrice,
        };
      });

      await onBatchUpdatePricing(updates);
      setBatchSuccessMsg(`Berhasil memperbarui rasio profit untuk ${updates.length} produk!`);
      setTimeout(() => setBatchSuccessMsg(null), 4000);
    } catch (e) {
      console.error(e);
      alert('Gagal memperbarui harga massal');
    } finally {
      setIsApplyingBatch(false);
    }
  };

  // Simulation calculations
  const simCalculatedSell = calculateSellingPriceFromBuyPrice(simBuyPrice, simMarkupRatio);
  const simNominalProfit = simCalculatedSell - simBuyPrice;
  const simMarginPercent = simCalculatedSell > 0 ? (simNominalProfit / simCalculatedSell) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#E8DEC8] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1">
            <span>Rata-Rata Markup Profit</span>
            <div className="w-7 h-7 rounded-lg bg-[#D8F3DC] text-[#1B4332] flex items-center justify-center">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1B4332]">{averageMarkup}%</div>
          <div className="text-[11px] text-[#2D6A4F] font-semibold mt-1">Rasio harga jual terhadap modal beli</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DEC8] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1">
            <span>Total Modal HPP Gudang</span>
            <div className="w-7 h-7 rounded-lg bg-[#F4EFE6] text-[#8B5E3C] flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-gray-900">{formatRupiah(totalCostValue)}</div>
          <div className="text-[11px] text-[#78350F]/70 font-semibold mt-1">Dari total {totalStockCount} unit stok fisik</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DEC8] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1">
            <span>Potensi Nilai Jual Stok</span>
            <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
              <BarChart2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-[#1B4332]">{formatRupiah(totalSalesValue)}</div>
          <div className="text-[11px] text-[#2D6A4F] font-semibold mt-1">Jika seluruh persediaan terjual</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DEC8] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1">
            <span>Potensi Laba Kotor Toko</span>
            <div className="w-7 h-7 rounded-lg bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-[#2D6A4F]">+{formatRupiah(totalPotentialProfit)}</div>
          <div className="text-[11px] text-[#1B4332] font-semibold mt-1">Margin keuntungan bersih persediaan</div>
        </div>
      </div>

      {/* Auto Ratio Profit Batch Tool & Simulator Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Kolom 1: Batch Auto Ratio Markup Tool */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-[#E8DEC8] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4 text-[#D97706]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#1B4332]">
                Otomatisasi Rasio Profit Harga Jual
              </h3>
              <p className="text-[11px] text-[#78350F]/70">
                Terapkan rumus otomatis: <code>Harga Jual = Harga Beli + (Harga Beli × Rasio Profit %)</code>
              </p>
            </div>
          </div>

          {batchSuccessMsg && (
            <div className="p-3 bg-[#D8F3DC] text-[#1B4332] rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
              <span>{batchSuccessMsg}</span>
            </div>
          )}

          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8DEC8] space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Target Rasio Profit Toko (% Markup):
                </label>
                <div className="text-[10px] text-gray-500">
                  Mengatur persentase keuntungan dari modal beli distributor
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-28">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={globalMarkupInput}
                    onChange={(e) => setGlobalMarkupInput(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-3 pr-8 py-2 text-sm font-black bg-white border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F] text-center"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    %
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleBatchApplyMarkup()}
                  disabled={isApplyingBatch}
                  className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  {isApplyingBatch ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Terapkan ke {selectedCat === 'Semua' ? 'Semua Produk' : selectedCat}</span>
                </button>
              </div>
            </div>

            {/* Rekomendasi Rasio per Kategori Pertanian */}
            <div className="pt-2 border-t border-[#E8DEC8]">
              <div className="text-[11px] font-bold text-gray-600 mb-2">
                Rekomendasi Standar Profit Berdasarkan Kategori:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.entries(CATEGORY_DEFAULT_MARKUP) as [ProductCategory, number][]).map(([cat, markup]) => (
                  <button
                    key={cat}
                    onClick={() => handleBatchApplyMarkup(cat)}
                    disabled={isApplyingBatch}
                    className="p-2 bg-white hover:bg-[#EAE0D0] border border-[#D5C7B0] rounded-xl text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-[10px] font-semibold text-gray-600 truncate">{cat}</div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs font-black text-[#1B4332]">+{markup}%</span>
                      <span className="text-[9px] text-[#2D6A4F] font-bold group-hover:underline">Terapkan</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Kolom 2: Interactive Simulator */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#FEF3C7]/40 via-white to-[#D8F3DC]/40 p-5 rounded-3xl border border-[#E8DEC8] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#1B4332] text-[#FEF3C7] flex items-center justify-center font-black">
                <TrendingUp className="w-4 h-4 text-[#74C69D]" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                Simulasi Hitung Harga & Profit
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  1. Harga Beli dari Supplier (Modal HPP):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1000"
                    value={simBuyPrice}
                    onChange={(e) => setSimBuyPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#D5C7B0] rounded-xl outline-none font-bold text-gray-900 focus:border-[#2D6A4F]"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-gray-700">
                    2. Rasio Markup Profit (%):
                  </label>
                  <span className="font-black text-[#1B4332] bg-[#D8F3DC] px-2 py-0.5 rounded text-xs">
                    +{simMarkupRatio}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={simMarkupRatio}
                  onChange={(e) => setSimMarkupRatio(Number(e.target.value))}
                  className="w-full accent-[#2D6A4F] cursor-pointer"
                />
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#D5C7B0] space-y-2 mt-2">
                <div className="flex justify-between text-gray-600">
                  <span>Modal Awal:</span>
                  <span className="font-bold">{formatRupiah(simBuyPrice)}</span>
                </div>
                <div className="flex justify-between text-[#2D6A4F] font-bold">
                  <span>Keuntungan Kotor:</span>
                  <span>+{formatRupiah(simNominalProfit)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#1B4332] pt-1.5 border-t border-[#FAF8F5]">
                  <span>Harga Jual Rekomendasi:</span>
                  <span className="text-base text-[#1B4332]">{formatRupiah(simCalculatedSell)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-[#78350F]/70 pt-2 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
            <span>Harga jual otomatis dibulatkan ke ratusan rupiah terdekat agar memudahkan kembalian kasir.</span>
          </div>
        </div>
      </div>

      {/* Tabel Data Produk & Pengaturan Harga */}
      <div className="bg-white rounded-3xl border border-[#E8DEC8] shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 bg-[#FAF8F5] border-b border-[#E8DEC8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <input
                type="text"
                placeholder="Cari nama produk atau SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F]"
              />
              <Search className="w-3.5 h-3.5 text-[#8B5E3C] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value as ProductCategory | 'Semua')}
              className="px-3 py-1.5 text-xs bg-white border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F] font-semibold text-gray-700"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-gray-500 font-semibold self-end sm:self-center">
            Menampilkan {filteredProducts.length} dari {products.length} produk
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8DEC8] text-gray-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Produk & SKU</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Stok Gudang</th>
                <th className="py-3 px-3">Harga Beli (Modal)</th>
                <th className="py-3 px-3">Rasio Profit (%)</th>
                <th className="py-3 px-3">Harga Jual</th>
                <th className="py-3 px-3">Laba Bersih / Unit</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DEC8]">
              {filteredProducts.map((p) => {
                const buyPrice = getProductBuyPrice(p);
                const profitRatio = getProductProfitRatio(p);
                const profitMetrics = calculateProfitMetrics(p.price, buyPrice);
                const sku = getProductSku(p);

                return (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    {/* Produk info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#D5C7B0] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 truncate max-w-xs">{p.name}</div>
                          <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1.5">
                            <span className="font-bold text-[#8B5E3C]">{sku}</span>
                            <span>•</span>
                            <span>{p.unit}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="py-3 px-3 text-gray-600 truncate max-w-32">{p.category}</td>

                    {/* Stok */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                          p.stock <= 0
                            ? 'bg-rose-100 text-rose-800'
                            : p.stock <= (p.minStockAlert || 10)
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-[#D8F3DC] text-[#1B4332]'
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>

                    {/* Harga Beli */}
                    <td className="py-3 px-3 font-semibold text-gray-700">
                      {formatRupiah(buyPrice)}
                    </td>

                    {/* Rasio Profit */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded-md font-bold text-[11px]">
                        +{profitRatio}%
                      </span>
                    </td>

                    {/* Harga Jual */}
                    <td className="py-3 px-3 font-black text-[#1B4332] text-sm">
                      {formatRupiah(p.price)}
                    </td>

                    {/* Laba per unit */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#2D6A4F]">
                        +{formatRupiah(profitMetrics.nominalProfit)}
                      </div>
                      <div className="text-[10px] text-gray-500">Margin: {profitMetrics.marginPercent}%</div>
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openEditModal(p)}
                        className="py-1.5 px-3 bg-[#FAF8F5] hover:bg-[#EAE0D0] text-[#1B4332] border border-[#D5C7B0] rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#8B5E3C]" />
                        <span>Ubah Harga</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Harga & Auto Ratio Produk */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E8DEC8] my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 bg-[#1B4332] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#74C69D]" />
                  <span>Atur Harga & Rasio Profit</span>
                </h3>
                <p className="text-xs text-[#D8F3DC] truncate max-w-md mt-0.5">{editingProduct.name}</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Product mini card */}
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8DEC8] flex items-center gap-3">
                <img
                  src={editingProduct.imageUrl}
                  alt={editingProduct.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#D5C7B0]"
                />
                <div>
                  <div className="font-bold text-gray-900">{editingProduct.name}</div>
                  <div className="text-[11px] text-gray-500">
                    Kategori: {editingProduct.category} • Satuan: {editingProduct.unit}
                  </div>
                </div>
              </div>

              {/* 3 Input Interkoneksi: Beli, Markup %, Jual */}
              <div className="space-y-3 p-4 bg-white rounded-2xl border border-[#D5C7B0]">
                {/* 1. Harga Beli */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    1. Harga Beli dari Supplier / Modal HPP (Rp):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="500"
                      value={editBuyPrice}
                      onChange={(e) => handleEditBuyPriceChange(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 text-sm font-bold bg-[#FAF8F5] border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F]"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">Rp</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Biaya modal per kemasan / unit barang.</div>
                </div>

                {/* 2. Rasio Profit Markup % */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700">
                      2. Rasio Profit Markup (%):
                    </label>
                    <span className="text-xs font-black text-[#1B4332] bg-[#D8F3DC] px-2 py-0.5 rounded">
                      +{editMarkupRatio}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="150"
                      step="1"
                      value={editMarkupRatio}
                      onChange={(e) => handleEditMarkupRatioChange(Number(e.target.value))}
                      className="flex-1 accent-[#2D6A4F] cursor-pointer"
                    />
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={editMarkupRatio}
                      onChange={(e) => handleEditMarkupRatioChange(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-xs text-center font-bold border border-[#D5C7B0] rounded-lg"
                    />
                  </div>
                </div>

                {/* 3. Harga Jual Otomatis */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    3. Harga Jual Akhir ke Pelanggan (Rp):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1000"
                      value={editSellingPrice}
                      onChange={(e) => handleEditSellingPriceChange(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 text-sm font-black text-[#1B4332] bg-white border-2 border-[#2D6A4F] rounded-xl outline-none"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#1B4332]">Rp</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Otomatis terhitung dari Harga Beli + Rasio Profit. Dapat juga disesuaikan manual.
                  </div>
                </div>

                {/* Profit Result Breakdown */}
                <div className="p-3 bg-[#D8F3DC]/40 rounded-xl border border-[#74C69D]/40 text-xs flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-gray-600 font-semibold">Keuntungan Kotor per Unit:</div>
                    <div className="text-sm font-black text-[#2D6A4F]">
                      +{formatRupiah(editSellingPrice - editBuyPrice)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-600 font-semibold">Margin Penjualan:</div>
                    <div className="text-xs font-bold text-[#1B4332]">
                      {editSellingPrice > 0 ? Math.round(((editSellingPrice - editBuyPrice) / editSellingPrice) * 1000) / 10 : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="p-4 bg-[#FAF8F5] border-t border-[#E8DEC8] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-[#D5C7B0] rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSinglePrice}
                disabled={isSavingSingle || editSellingPrice <= 0}
                className="px-5 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {isSavingSingle ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Pengaturan Harga</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
