import React, { useState } from 'react';
import { X, ShoppingCart, Star, AlertTriangle, ShieldCheck, Plus, Minus } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah } from '../utils/formatters';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCartWithQty: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCartWithQty,
}) => {
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const maxAvailable = product.stock;

  const handleIncrement = () => {
    if (qty < maxAvailable) setQty((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (qty > 1) setQty((prev) => prev - 1);
  };

  const handleAdd = () => {
    onAddToCartWithQty(product, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E8DEC8] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-gray-500 hover:text-gray-900 shadow-md backdrop-blur-xs transition-colors cursor-pointer border border-[#E8DEC8]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="space-y-3">
              <div className="aspect-square rounded-2xl overflow-hidden bg-[#F4EFE6] border border-[#E8DEC8]">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between text-xs bg-[#D8F3DC]/60 p-2.5 rounded-xl border border-[#B7E4C7]">
                <span className="flex items-center gap-1.5 text-[#1B4332] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                  Jaminan 100% Produk EcoAgro Asli
                </span>
                <span className="text-[#78350F]/70 text-[11px] font-mono">ID: {product.id}</span>
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                    {product.category}
                  </span>
                  <span className="text-xs text-[#78350F]/80 bg-[#F4EFE6] border border-[#E0D4C0] px-2 py-0.5 rounded-md font-bold">
                    {product.unit}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold text-[#1B4332] leading-snug">
                  {product.name}
                </h2>

                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-1 text-[#F59E0B] font-bold">
                    <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500 font-medium">Terjual {product.soldCount} pesanan</span>
                </div>

                <div className="mt-4 p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8DEC8]">
                  <span className="text-[11px] text-[#8B5E3C] font-bold uppercase tracking-wider">Harga Resmi Petani:</span>
                  <div className="text-2xl font-black text-[#1B4332]">
                    {formatRupiah(product.price)}
                  </div>
                  <div className="text-xs text-[#78350F]/80 mt-1">
                    Stok Tersedia: <b className={product.stock <= 5 ? 'text-rose-600' : 'text-[#2D6A4F]'}>{product.stock} {product.unit}</b>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">Spesifikasi & Dosis Pakai:</h4>
                  <p className="mt-1.5 text-xs text-[#4A3E31] leading-relaxed whitespace-pre-line bg-[#FBF9F4] p-3 rounded-xl border border-[#EAE0D0] max-h-40 overflow-y-auto">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Action area */}
              <div className="mt-6 pt-4 border-t border-[#F0EAE1]">
                {!isOutOfStock ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#4A3E31]">Jumlah Pembelian:</span>
                      <div className="flex items-center border border-[#D5C7B0] rounded-xl overflow-hidden bg-white shadow-2xs">
                        <button
                          onClick={handleDecrement}
                          disabled={qty <= 1}
                          className="p-2 hover:bg-gray-100 disabled:opacity-30 transition-colors cursor-pointer text-[#78350F]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-xs font-bold text-[#1B4332]">
                          {qty}
                        </span>
                        <button
                          onClick={handleIncrement}
                          disabled={qty >= maxAvailable}
                          className="p-2 hover:bg-gray-100 disabled:opacity-30 transition-colors cursor-pointer text-[#78350F]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Total Subtotal:</span>
                      <span className="text-sm font-extrabold text-[#1B4332]">
                        {formatRupiah(product.price * qty)}
                      </span>
                    </div>

                    <button
                      onClick={handleAdd}
                      className="w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-[#2D6A4F]/20 transition-all cursor-pointer border border-[#52B788]/30"
                    >
                      <ShoppingCart className="w-4 h-4 text-[#D8F3DC]" />
                      Masukkan ke Keranjang ({qty} {product.unit})
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Mohon maaf, stok produk ini saat ini sedang habis. Silakan hubungi admin untuk info restock.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
