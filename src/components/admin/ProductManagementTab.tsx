import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  RotateCcw, 
  AlertTriangle, 
  Check, 
  Loader2, 
  Sparkles, 
  Image, 
  PackagePlus,
  TrendingUp,
  Percent,
  Barcode
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { 
  calculateSellingPriceFromBuyPrice, 
  getProductBuyPrice, 
  getProductProfitRatio, 
  getProductSku, 
  calculateProfitMetrics 
} from '../../utils/pricingUtils';

interface ProductManagementTabProps {
  products: Product[];
  onSaveProduct: (product: Partial<Product> & { id?: string }) => Promise<string>;
  onUpdateStock: (productId: string, newStock: number) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onResetDefaultProducts: () => Promise<void>;
}

export const ProductManagementTab: React.FC<ProductManagementTabProps> = ({
  products,
  onSaveProduct,
  onUpdateStock,
  onDeleteProduct,
  onResetDefaultProducts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('Semua');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Benih & Bibit Unggul');
  const [formSku, setFormSku] = useState('');
  const [formBuyPrice, setFormBuyPrice] = useState<number>(40000);
  const [formProfitRatio, setFormProfitRatio] = useState<number>(25);
  const [formPrice, setFormPrice] = useState<number>(50000);
  const [formStock, setFormStock] = useState<number>(10);
  const [formMinStock, setFormMinStock] = useState<number>(10);
  const [formUnit, setFormUnit] = useState('Kemasan 1 kg');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);

  const categories: (ProductCategory | 'Semua')[] = [
    'Semua',
    'Benih & Bibit Unggul',
    'Pupuk, Nutrisi & Hayati',
    'Pestisida & Proteksi Tanaman',
    'Alat, Mesin & Perlengkapan Tani',
    'Irigasi & Greenhouse',
    'Ternak, Wadah & Pasca Panen',
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'Semua' || p.category === selectedCat;
    const sku = getProductSku(p);
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Benih & Bibit Unggul');
    setFormSku('');
    setFormBuyPrice(40000);
    setFormProfitRatio(25);
    setFormPrice(50000);
    setFormStock(25);
    setFormMinStock(10);
    setFormUnit('Kemasan 1 kg');
    setFormDescription('');
    setFormImageUrl('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80');
    setFormFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormSku(getProductSku(product));
    const buyPrice = getProductBuyPrice(product);
    const profitRatio = getProductProfitRatio(product);
    setFormBuyPrice(buyPrice);
    setFormProfitRatio(profitRatio);
    setFormPrice(product.price);
    setFormStock(product.stock);
    setFormMinStock(product.minStockAlert || 10);
    setFormUnit(product.unit);
    setFormDescription(product.description);
    setFormImageUrl(product.imageUrl);
    setFormFeatured(product.featured);
    setIsModalOpen(true);
  };

  // Live Auto Ratio handlers in Form
  const handleBuyPriceChange = (newBuy: number) => {
    setFormBuyPrice(newBuy);
    const calculatedSell = calculateSellingPriceFromBuyPrice(newBuy, formProfitRatio);
    setFormPrice(calculatedSell);
  };

  const handleProfitRatioChange = (newRatio: number) => {
    setFormProfitRatio(newRatio);
    const calculatedSell = calculateSellingPriceFromBuyPrice(formBuyPrice, newRatio);
    setFormPrice(calculatedSell);
  };

  const handleSellingPriceChange = (newSell: number) => {
    setFormPrice(newSell);
    if (formBuyPrice > 0) {
      const ratio = ((newSell - formBuyPrice) / formBuyPrice) * 100;
      setFormProfitRatio(Math.round(ratio * 10) / 10);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice <= 0) return;

    try {
      setIsSaving(true);
      await onSaveProduct({
        id: editingProduct?.id,
        name: formName.trim(),
        category: formCategory,
        sku: formSku.trim() || undefined,
        buyPrice: Number(formBuyPrice) || 0,
        profitRatio: Number(formProfitRatio) || 0,
        price: Number(formPrice),
        stock: Number(formStock),
        minStockAlert: Number(formMinStock),
        unit: formUnit.trim(),
        description: formDescription.trim(),
        imageUrl: formImageUrl.trim() || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
        featured: formFeatured,
      });
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${productName}" dari database?`)) {
      await onDeleteProduct(productId);
    }
  };

  const handleReset = async () => {
    if (confirm('Muat ulang 50 produk awal EcoAgro? Data produk akan disinkronkan kembali ke database.')) {
      try {
        setIsResetting(true);
        await onResetDefaultProducts();
        alert('Berhasil mereset 50 produk awal!');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk atau SKU kasir..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 text-gray-800"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-semibold text-gray-700"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Muat ulang 50 produk pertanian resmi bawaan sistem"
            className="px-3 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset 50 Produk</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
              <tr>
                <th className="py-3 px-4">Produk & SKU</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Modal Beli</th>
                <th className="py-3 px-4">Harga Jual</th>
                <th className="py-3 px-4 text-center">Stok Gudang</th>
                <th className="py-3 px-4 text-center">Terjual</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= (p.minStockAlert || 10);
                const buyPrice = getProductBuyPrice(p);
                const profitRatio = getProductProfitRatio(p);
                const sku = getProductSku(p);

                return (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Product Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 line-clamp-1">{p.name}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#8B5E3C]">{sku}</span>
                            <span>•</span>
                            <span>{p.unit}</span>
                          </div>
                          {p.featured && (
                            <span className="inline-block text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded mt-0.5">
                              Unggulan
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {p.category}
                      </span>
                    </td>

                    {/* Modal Beli */}
                    <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                      <div>{formatRupiah(buyPrice)}</div>
                      <div className="text-[10px] text-[#2D6A4F] font-bold">Markup +{profitRatio}%</div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 whitespace-nowrap font-black text-gray-900">
                      {formatRupiah(p.price)}
                    </td>

                    {/* Stock Adjuster */}
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => onUpdateStock(p.id, p.stock - 1)}
                          disabled={p.stock <= 0}
                          title="Kurangi stok"
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                        >
                          -
                        </button>
                        <span className={`min-w-8 font-black text-xs ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-gray-900'}`}>
                          {p.stock}
                        </span>
                        <button
                          onClick={() => onUpdateStock(p.id, p.stock + 1)}
                          title="Tambah stok"
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {isLowStock && (
                        <div className="text-[10px] text-amber-600 font-bold mt-1">Stok Kritis</div>
                      )}
                      {isOutOfStock && (
                        <div className="text-[10px] text-rose-600 font-bold mt-1">Stok Habis</div>
                      )}
                    </td>

                    {/* Sold count */}
                    <td className="py-3 px-4 whitespace-nowrap text-center font-bold text-gray-700">
                      {p.soldCount}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Edit Produk"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Tidak ada produk yang cocok dengan pencarian "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">
                  {editingProduct ? 'Edit Data Produk Pertanian' : 'Tambah Produk Pertanian Baru'}
                </h3>
                <p className="text-xs text-emerald-200">
                  Lengkapi data produk, SKU, modal beli, dan kalkulasi rasio profit otomatis
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Benih Cabai Rawit Ori 212"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                  >
                    <option value="Benih & Bibit Unggul">Benih & Bibit Unggul</option>
                    <option value="Pupuk, Nutrisi & Hayati">Pupuk, Nutrisi & Hayati</option>
                    <option value="Pestisida & Proteksi Tanaman">Pestisida & Proteksi Tanaman</option>
                    <option value="Alat, Mesin & Perlengkapan Tani">Alat, Mesin & Perlengkapan Tani</option>
                    <option value="Irigasi & Greenhouse">Irigasi & Greenhouse</option>
                    <option value="Ternak, Wadah & Pasca Panen">Ternak, Wadah & Pasca Panen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kode Barcode / SKU Kasir
                  </label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="Contoh: ECO-BNH-001"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-mono uppercase"
                  />
                </div>
              </div>

              {/* Sesi Auto Ratio Profit & Penetapan Harga */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8DEC8] space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B4332]">
                  <TrendingUp className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Kalkulasi Otomatis Harga Jual dari Modal Beli</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Harga Beli / HPP (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1000}
                      value={formBuyPrice}
                      onChange={(e) => handleBuyPriceChange(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Rasio Markup (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={300}
                        value={formProfitRatio}
                        onChange={(e) => handleProfitRatioChange(Number(e.target.value))}
                        className="w-full pl-3 pr-7 py-2 text-xs bg-white border border-gray-200 rounded-xl outline-none font-bold text-center"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-bold">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Harga Jual Akhir (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={1000}
                      value={formPrice}
                      onChange={(e) => handleSellingPriceChange(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border-2 border-[#2D6A4F] rounded-xl outline-none font-black text-[#1B4332]"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-[#2D6A4F] font-bold flex justify-between bg-white px-3 py-1.5 rounded-xl border border-[#D5C7B0]">
                  <span>Estimasi Laba Kotor per Unit:</span>
                  <span>+{formatRupiah(formPrice - formBuyPrice)} ({formPrice > 0 ? Math.round(((formPrice - formBuyPrice) / formPrice) * 100) : 0}% margin)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Satuan / Kemasan
                  </label>
                  <input
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="Kemasan 1 kg"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Stok Fisik <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ambang Stok Kritis
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  URL Foto Produk (Gambar Unsplash / CDN)
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Deskripsi & Manfaat Produk
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Jelaskan kegunaan, dosis, dan petunjuk pemakaian..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="featured" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Tampilkan sebagai Produk Unggulan di Beranda
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Produk</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
