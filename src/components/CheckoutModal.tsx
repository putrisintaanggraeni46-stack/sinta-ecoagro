import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  QrCode, 
  Building, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Check, 
  Truck, 
  Banknote, 
  Sparkles, 
  ShieldCheck,
  Tag
} from 'lucide-react';
import { CartItem, Order, PaymentMethod, ShippingCourier, UserAccount } from '../types';
import { 
  formatRupiah, 
  getPaymentMethodInfo, 
  getCourierInfo, 
  calculateCartDiscount,
  AUTO_DISCOUNT_THRESHOLD
} from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  loggedInCustomer: UserAccount | null;
  onSubmitOrder: (orderData: Omit<Order, 'id'>) => Promise<string | undefined>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  loggedInCustomer,
  onSubmitOrder,
}) => {
  const modalScrollRef = useRef<HTMLFormElement>(null);
  const [customerName, setCustomerName] = useState(loggedInCustomer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(loggedInCustomer?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(loggedInCustomer?.address || '');
  const [notes, setNotes] = useState('');
  const [shippingCourier, setShippingCourier] = useState<ShippingCourier>('kurir_toko');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer_bca');
  const [couponCode, setCouponCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);

  // Sync if customer logged in
  useEffect(() => {
    if (loggedInCustomer) {
      if (!customerName) setCustomerName(loggedInCustomer.name);
      if (!customerPhone) setCustomerPhone(loggedInCustomer.phone);
      if (!customerAddress) setCustomerAddress(loggedInCustomer.address);
    }
  }, [loggedInCustomer]);

  if (!isOpen) return null;

  const rawSubtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discountInfo = calculateCartDiscount(rawSubtotal, couponCode);
  const selectedBankInfo = getPaymentMethodInfo(paymentMethod);

  const handleCopyAcc = () => {
    navigator.clipboard.writeText(selectedBankInfo.accountNumber.replace(/[^0-9]/g, ''));
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Nama lengkap pembeli wajib diisi');
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMsg('Nomor WhatsApp aktif wajib diisi minimal 8 digit');
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!customerAddress.trim()) {
      setErrorMsg('Alamat pengiriman lengkap wajib diisi');
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (cartItems.length === 0) {
      setErrorMsg('Keranjang belanja kosong');
      return;
    }

    try {
      setIsSubmitting(true);
      // Generate order number ECO-YYYYMM-XXXX
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const orderNumber = `ECO-${datePart}-${randomSuffix}`;

      const orderItems = cartItems.map((ci) => ({
        productId: ci.product.id,
        name: ci.product.name,
        price: ci.product.price,
        quantity: ci.quantity,
        unit: ci.product.unit,
        subtotal: ci.product.price * ci.quantity,
        imageUrl: ci.product.imageUrl || '',
      }));

      const orderPayload: Omit<Order, 'id'> = {
        orderNumber,
        customerId: loggedInCustomer?.id || 'guest',
        customerEmail: loggedInCustomer?.email || '',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        notes: notes.trim() || '',
        items: orderItems,
        subtotalAmount: rawSubtotal,
        discountAmount: discountInfo.discountAmount || 0,
        discountReason: discountInfo.discountReason || '',
        systemDiscountAmount: discountInfo.systemDiscountAmount || 0,
        couponCode: couponCode ? couponCode.trim() : '',
        shippingCourier,
        shippingFee: 0,
        totalAmount: discountInfo.finalTotal,
        status: 'pending_payment',
        paymentMethod,
        paymentProofUrl: '',
        paymentProofDate: '',
        adminNotes: '',
        trackingNumber: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const submitPromise = onSubmitOrder(orderPayload);
      const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 6000));
      await Promise.race([submitPromise, timeoutPromise]);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Gagal membuat pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-[#E8DEC8] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Always Fixed at Top, Never Cut Off */}
        <div className="shrink-0 p-4 sm:p-5 bg-[#1B4332] text-white flex items-center justify-between border-b border-[#2D6A4F] z-10 shadow-xs">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">Formulir Checkout EcoAgro</h2>
            <p className="text-xs text-[#D8F3DC] mt-0.5">
              Isi data pengiriman & pilih metode pembayaran
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl bg-[#2D6A4F] hover:bg-[#40916C] text-white transition-colors cursor-pointer"
            title="Tutup Formulir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body - User can scroll naturally without the top ever getting clipped */}
        <form 
          ref={modalScrollRef} 
          onSubmit={handleSubmit} 
          className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5 overscroll-contain"
        >
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-bold text-rose-800">Perhatian: </span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}
          {/* Section 1: Customer Details */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#D8F3DC] text-[#1B4332] text-[11px] font-black flex items-center justify-center">1</span>
                Informasi Pembeli / Petani
              </h3>
              {loggedInCustomer && (
                <span className="text-[11px] text-[#2D6A4F] font-bold bg-[#D8F3DC] px-2 py-0.5 rounded-full">
                  Akun: {loggedInCustomer.email}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  {hasAttemptedSubmit && !customerName.trim() && (
                    <span className="text-[10px] text-rose-600 font-bold">Wajib diisi</span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Contoh: Pak Budi Santoso"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl outline-none transition-all ${
                    hasAttemptedSubmit && !customerName.trim()
                      ? 'bg-rose-50/50 border-2 border-rose-400 focus:border-rose-500'
                      : 'bg-[#FAF8F5] border border-[#D5C7B0] focus:bg-white focus:border-[#2D6A4F]'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                  </label>
                  {hasAttemptedSubmit && customerPhone.replace(/[^0-9]/g, '').length < 8 && (
                    <span className="text-[10px] text-rose-600 font-bold">Min. 8 digit angka</span>
                  )}
                </div>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl outline-none transition-all ${
                    hasAttemptedSubmit && customerPhone.replace(/[^0-9]/g, '').length < 8
                      ? 'bg-rose-50/50 border-2 border-rose-400 focus:border-rose-500'
                      : 'bg-[#FAF8F5] border border-[#D5C7B0] focus:bg-white focus:border-[#2D6A4F]'
                  }`}
                />
              </div>
            </div>

            <div className="mt-3.5">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Alamat Lengkap Pengiriman Lahan / Rumah <span className="text-rose-500">*</span>
                </label>
                {hasAttemptedSubmit && !customerAddress.trim() && (
                  <span className="text-[10px] text-rose-600 font-bold">Wajib diisi</span>
                )}
              </div>
              <textarea
                rows={2}
                placeholder="Dusun/Jalan, RT/RW, Desa/Kelurahan, Kecamatan, Kabupaten/Kota, Kode Pos"
                value={customerAddress}
                onChange={(e) => {
                  setCustomerAddress(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className={`w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl outline-none transition-all ${
                  hasAttemptedSubmit && !customerAddress.trim()
                    ? 'bg-rose-50/50 border-2 border-rose-400 focus:border-rose-500'
                    : 'bg-[#FAF8F5] border border-[#D5C7B0] focus:bg-white focus:border-[#2D6A4F]'
                }`}
              />
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Catatan Pesanan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Kirim pagi sebelum jam 10 atau titipkan di pos kelompok tani"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#D5C7B0] rounded-xl outline-none focus:bg-white focus:border-[#2D6A4F]"
              />
            </div>
          </div>

          {/* Section 2: Pilihan Kurir Pengiriman */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#D8F3DC] text-[#1B4332] text-[11px] font-black flex items-center justify-center">2</span>
              Pilih Metode Pengiriman Kurir
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'kurir_toko', label: 'Kurir Toko EcoAgro', desc: 'Armada toko pick-up langsung' },
                { id: 'jne_kargo', label: 'JNE Trucking / Kargo', desc: 'Pengiriman karung / barang berat' },
                { id: 'ambil_gudang', label: 'Ambil di Gudang', desc: 'Ambil langsung mandiri' },
              ].map((c) => {
                const isSelected = shippingCourier === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setShippingCourier(c.id as ShippingCourier)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#2D6A4F] bg-[#D8F3DC]/70 shadow-xs ring-2 ring-[#2D6A4F]/20'
                        : 'border-[#E8DEC8] hover:border-[#D5C7B0] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Truck className={`w-4 h-4 ${isSelected ? 'text-[#1B4332]' : 'text-gray-400'}`} />
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />}
                    </div>
                    <span className="text-xs font-bold text-gray-900">{c.label}</span>
                    <span className="text-[10px] text-gray-500 mt-0.5">{c.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#D8F3DC] text-[#1B4332] text-[11px] font-black flex items-center justify-center">3</span>
              Pilih Metode Pembayaran
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'transfer_bca', label: 'BCA Transfer', icon: Building },
                { id: 'transfer_mandiri', label: 'Mandiri Transfer', icon: Building },
                { id: 'transfer_bri', label: 'BRI Transfer', icon: Building },
                { id: 'qris', label: 'QRIS Semua Bank', icon: QrCode },
                { id: 'cod', label: 'COD (Bayar di Tempat)', icon: Banknote },
              ].map((item) => {
                const isSelected = paymentMethod === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setPaymentMethod(item.id as PaymentMethod)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#2D6A4F] bg-[#D8F3DC]/80 shadow-xs ring-2 ring-[#2D6A4F]/20'
                        : 'border-[#E8DEC8] hover:border-[#D5C7B0] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <IconComponent className={`w-4 h-4 ${isSelected ? 'text-[#1B4332]' : 'text-gray-400'}`} />
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />}
                    </div>
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-[#1B4332]' : 'text-gray-800'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Rekening Info Card */}
            {paymentMethod !== 'cod' ? (
              <div className="mt-3 p-3.5 bg-[#FAF8F5] border border-[#E8DEC8] rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#8B5E3C] uppercase tracking-wider">
                      {selectedBankInfo.name}
                    </span>
                    <div className="text-base font-black text-gray-900 flex items-center gap-2 mt-0.5">
                      <span>{selectedBankInfo.accountNumber}</span>
                      <button
                        type="button"
                        onClick={handleCopyAcc}
                        className="p-1 rounded-lg bg-white border border-[#D5C7B0] hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                        title="Salin nomor rekening"
                      >
                        {copiedBank ? <Check className="w-3.5 h-3.5 text-[#2D6A4F]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      a.n. <b className="text-[#1B4332]">{selectedBankInfo.accountHolder}</b>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-gray-500">Total Transfer:</span>
                    <div className="text-base font-black text-[#1B4332]">
                      {formatRupiah(discountInfo.finalTotal)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900">
                💵 <b>Metode COD (Cash on Delivery):</b> Siapkan uang tunai pas sebesar <b>{formatRupiah(discountInfo.finalTotal)}</b> saat kurir EcoAgro menyerahkan barang di lokasi Anda.
              </div>
            )}
          </div>

          {/* Section 4: Promo Diskon Otomatis & Kupon */}
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8DEC8] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#D8F3DC] text-[#1B4332] text-[11px] font-black flex items-center justify-center">4</span>
                Promo & Potongan Harga
              </h3>
            </div>

            {discountInfo.qualifiesForAutoDiscount ? (
              <div className="p-3 bg-gradient-to-r from-[#D8F3DC] to-[#B7E4C7] rounded-xl border border-[#52B788] text-xs text-[#1B4332] space-y-1">
                <div className="font-black flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span>🎉 Diskon Otomatis 10% Diterapkan</span>
                </div>
                <p className="text-[11px] text-[#2D6A4F]">
                  Total belanjaan Anda mencapai <b>{formatRupiah(rawSubtotal)}</b> (minimal Rp 1 Juta). Pesanan ini langsung mendapatkan potongan sebesar <b>-{formatRupiah(discountInfo.systemDiscountAmount)}</b>!
                </p>
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-[#D5C7B0] text-xs text-[#78350F] flex items-center justify-between">
                <div>
                  <span className="font-bold flex items-center gap-1 text-[#1B4332]">
                    <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                    Promo Diskon Otomatis 10%
                  </span>
                  <p className="text-[11px] text-[#8B5E3C] mt-0.5">
                    Belanja minimal Rp 1.000.000 untuk mendapatkan potongan harga 10%!
                  </p>
                </div>
                <span className="text-[10px] bg-[#FEF3C7] text-[#92400E] px-2 py-1 rounded-lg font-bold shrink-0">
                  Kurang {formatRupiah(AUTO_DISCOUNT_THRESHOLD - rawSubtotal)}
                </span>
              </div>
            )}

            {/* Kupon Promo Input */}
            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Kode Kupon Promo (PANENRAYA / ECOAGRO50)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F] uppercase font-mono"
                />
                <Tag className="w-3.5 h-3.5 text-[#8B5E3C] absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Section 5: Ringkasan Total Tagihan */}
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8DEC8] space-y-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#D8F3DC] text-[#1B4332] text-[11px] font-black flex items-center justify-center">5</span>
              Ringkasan Pembayaran & Total Tagihan
            </h3>

            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.length} Produk):</span>
                <span className="font-semibold text-gray-900">{formatRupiah(rawSubtotal)}</span>
              </div>

              {/* Potongan Sistem 10% jika >= 1 Jt */}
              {discountInfo.systemDiscountAmount > 0 && (
                <div className="flex justify-between text-[#1B4332] bg-[#D8F3DC] px-2.5 py-1.5 rounded-xl font-bold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>Diskon 10% (Belanja ≥ 1 Jt):</span>
                  </span>
                  <span>-{formatRupiah(discountInfo.systemDiscountAmount)}</span>
                </div>
              )}

              {/* Kupon Promo jika ada */}
              {discountInfo.couponDiscountAmount > 0 && (
                <div className="flex justify-between text-[#2D6A4F] bg-white px-2.5 py-1.5 rounded-xl font-bold border border-[#D5C7B0]">
                  <span>Potongan Kupon ({couponCode.toUpperCase()}):</span>
                  <span>-{formatRupiah(discountInfo.couponDiscountAmount)}</span>
                </div>
              )}

              {discountInfo.discountAmount > 0 && (
                <div className="flex justify-between text-xs font-black text-[#2D6A4F] pt-1">
                  <span>Total Penghematan:</span>
                  <span>-{formatRupiah(discountInfo.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#2D6A4F]">
                <span>Biaya Pengiriman ({getCourierInfo(shippingCourier).name}):</span>
                <span className="font-bold">GRATIS</span>
              </div>

              <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-[#EAE0D0]">
                <span>Total yang Harus Dibayar:</span>
                <span className="text-base text-[#1B4332] font-black">{formatRupiah(discountInfo.finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 space-y-3">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 shadow-xs">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-800">Mohon Periksa Formulir:</div>
                  <div className="mt-0.5 text-rose-700 font-medium leading-relaxed">{errorMsg}</div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#081C15] disabled:opacity-60 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-[#2D6A4F]/25 transition-all cursor-pointer border border-[#52B788]/40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#74C69D]" />
                  <span>Memproses & Menyimpan Pesanan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#74C69D]" />
                  <span>Konfirmasi & Buat Pesanan ({formatRupiah(discountInfo.finalTotal)})</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#78350F]/70 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Pesanan terverifikasi otomatis dengan nomor unik & stok gudang terlindungi</span>
            </div>

            {/* Help Link */}
            <a
              href="https://wa.me/6285600556628?text=Halo%20EcoAgro,%20saya%20ada%20kendala%20saat%20mengisi%20checkout%20pesanan"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-[#FAF8F5] hover:bg-[#F4EFE6] border border-[#D5C7B0] text-[#1B4332] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Jika ada kendala silahkan hubungi</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};
