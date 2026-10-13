import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, RotateCcw, AlertTriangle, Check, Loader2, Sparkles, Image, PackagePlus } from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { formatRupiah } from '../../utils/formatters';

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
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(10);
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
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Benih & Bibit Unggul');
    setFormPrice(50000);
    setFormStock(25);
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
    setFormPrice(product.price);
    setFormStock(product.stock);
    setFormUnit(product.unit);
    setFormDescription(product.description);
    setFormImageUrl(product.imageUrl);
    setFormFeatured(product.featured);
    setIsModalOpen(true);
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
        price: Number(formPrice),
        stock: Number(formStock),
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
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        {/* Search & Category */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-56 flex-1">
            <input
              type="text"
              placeholder="Cari nama produk pertanian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCat(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCat === c
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Reset ke 50 produk default EcoAgro"
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset 50 Produk</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="text-xs font-bold text-gray-900">
            Total Produk Terdaftar: <span className="text-emerald-700">{products.length}</span> (Menampilkan {filteredProducts.length})
          </div>
          <div className="text-[11px] text-gray-500">
            Data tersinkronisasi otomatis dengan Firestore Database
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Harga (IDR)</th>
                <th className="py-3 px-4 text-center">Stok & Kontrol</th>
                <th className="py-3 px-4 text-center">Terjual</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= 10;

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
                          <div className="text-[11px] text-gray-400 mt-0.5">{p.unit}</div>
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

                      <div className="mt-1">
                        {isOutOfStock ? (
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Habis</span>
                        ) : isLowStock ? (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Menipis ({p.stock})</span>
                        ) : (
                          <span className="text-[9px] text-gray-400">Aman</span>
                        )}
                      </div>
                    </td>

                    {/* Sold count */}
                    <td className="py-3 px-4 text-center font-bold text-gray-700">
                      {p.soldCount}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit produk"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus produk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="font-black text-base">
                {editingProduct?.id ? 'Edit Data Produk Pertanian' : 'Tambah Produk Pertanian Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white cursor-pointer"
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
                    Satuan / Kemasan
                  </label>
                  <input
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="Contoh: Kemasan 1 kg / Botol 500 ml"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Harga Jual (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Jumlah Stok Fisik <span className="text-rose-500">*</span>
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
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Jelaskan keunggulan varietas, dosis pemakaian per tangki, dll..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featuredCheckbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="featuredCheckbox" className="text-xs font-semibold text-gray-700">
                  Tandai sebagai Produk Unggulan di Halaman Utama
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingProduct?.id ? 'Simpan Perubahan' : 'Tambah Produk'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
