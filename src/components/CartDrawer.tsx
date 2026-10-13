import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Sprout, Tag, Sparkles, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../types';
import { formatRupiah, calculateCartDiscount, AUTO_DISCOUNT_THRESHOLD } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');

  if (!isOpen) return null;

  const rawSubtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const discountInfo = calculateCartDiscount(rawSubtotal, appliedCoupon);
  const progressPercent = Math.min(100, Math.round((rawSubtotal / AUTO_DISCOUNT_THRESHOLD) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedCoupon(couponInput.trim().toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#2D6A4F] flex items-center justify-between bg-[#1B4332] text-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#2D6A4F] rounded-xl border border-[#52B788]/30">
                <ShoppingBag className="w-5 h-5 text-[#95D5B2]" />
              </div>
              <div>
                <h2 className="font-bold text-base sm:text-lg">Keranjang Belanja EcoAgro</h2>
                <p className="text-xs text-[#D8F3DC]">
                  {totalItemsCount} barang dipilih
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={onClearCart}
                  title="Kosongkan keranjang"
                  className="text-xs text-[#D8F3DC] hover:text-rose-300 p-1.5 transition-colors cursor-pointer"
                >
                  Kosongkan
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-[#2D6A4F] hover:bg-[#40916C] text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 10% Auto Discount Promotion Banner / Progress Bar */}
          {cartItems.length > 0 && (
            <div className="bg-[#FAF8F5] p-3.5 border-b border-[#E8DEC8]">
              {discountInfo.qualifiesForAutoDiscount ? (
                <div className="flex items-center gap-2 text-xs text-[#1B4332] bg-[#D8F3DC] p-2.5 rounded-xl border border-[#74C69D]">
                  <Sparkles className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <div>
                    <span className="font-extrabold">Selamat! Diskon Otomatis 10% Aktif</span>
                    <p className="text-[11px] text-[#2D6A4F]">
                      Anda menghemat <b className="font-black">{formatRupiah(discountInfo.discountAmount)}</b> untuk pembelian minimal 1 Juta!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#78350F]">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                      Promo Diskon Otomatis 10%
                    </span>
                    <span className="text-[#92400E]">
                      Tambah {formatRupiah(discountInfo.remainingForAutoDiscount)}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-[#EAE0D0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#F59E0B] to-[#2D6A4F] rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#8B5E3C]">
                    Belanja minimal Rp 1.000.000 untuk otomatis potong diskon 10%!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-gray-500">
                <div className="w-16 h-16 rounded-2xl bg-[#D8F3DC] text-[#1B4332] flex items-center justify-center mb-4">
                  <Sprout className="w-8 h-8 text-[#2D6A4F]" />
                </div>
                <h3 className="font-bold text-gray-800 text-base">Keranjang Masih Kosong</h3>
                <p className="text-xs text-[#78350F]/70 max-w-xs mt-1">
                  Pilih benih unggul, pupuk berbobot, atau alat mesin dari katalog EcoAgro.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Mulai Belanja Sekarang
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const maxStock = item.product.stock;
                const isMax = item.quantity >= maxStock;

                return (
                  <div
                    key={item.product.id}
                    className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8DEC8] flex gap-3 items-start group hover:border-[#2D6A4F] transition-colors"
                  >
                    {/* Thumbnail */}
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-white border border-[#D5C7B0]"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-gray-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                          title="Hapus barang"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#78350F]/70 mt-0.5">
                        {item.product.unit} • {formatRupiah(item.product.price)}
                      </div>

                      {/* Quantity Controls & Subtotal */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EAE0D0]">
                        <div className="flex items-center border border-[#D5C7B0] rounded-lg bg-white overflow-hidden shadow-2xs">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            disabled={isMax}
                            className="p-1 hover:bg-gray-100 text-gray-600 disabled:opacity-30 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-[#1B4332]">
                            {formatRupiah(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {isMax && (
                        <div className="text-[10px] text-amber-700 mt-1">
                          Mencapai batas stok ({maxStock} unit)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E8DEC8] bg-[#FAF8F5] space-y-3">
              {/* Optional Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Kode Kupon (PANENRAYA / ECOAGRO50)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F] uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#8B5E3C] hover:bg-[#78350F] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Terapkan
                </button>
              </form>

              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal Produk:</span>
                  <span className="font-semibold text-gray-900">{formatRupiah(rawSubtotal)}</span>
                </div>

                {discountInfo.discountAmount > 0 && (
                  <div className="flex justify-between text-[#1B4332] bg-[#D8F3DC] px-2 py-1 rounded-lg font-bold">
                    <span>{discountInfo.discountReason}:</span>
                    <span>-{formatRupiah(discountInfo.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#2D6A4F]">
                  <span>Biaya Pengiriman:</span>
                  <span className="font-bold">GRATIS (Promo Panen)</span>
                </div>

                <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-[#EAE0D0]">
                  <span>Total Tagihan:</span>
                  <span className="text-base text-[#1B4332] font-black">{formatRupiah(discountInfo.finalTotal)}</span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#081C15] text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-[#2D6A4F]/20 transition-all cursor-pointer border border-[#52B788]/30"
              >
                <span>Lanjut ke Formulir Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#D8F3DC]" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#78350F]/70">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Transaksi aman, order otomatis tercatat di database</span>
              </div>

              {/* WhatsApp Help Button */}
              <a
                href="https://wa.me/6285600556628?text=Halo%20EcoAgro,%20saya%20ada%20kendala%20saat%20cek%20keranjang%20belanja"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-[#E8F5E9] hover:bg-[#C8E6C9] border border-[#A5D6A7] text-[#1B4332] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                <span>Jika ada kendala silahkan hubungi</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
