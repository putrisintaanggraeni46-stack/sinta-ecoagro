import React, { useState } from 'react';
import { X, CheckCircle, Upload, Copy, Check, MessageSquare, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { Order } from '../types';
import { formatRupiah, getPaymentMethodInfo } from '../utils/formatters';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onSubmitProof: (orderId: string, proofUrl: string) => Promise<void>;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onSubmitProof,
}) => {
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!order) return null;

  const bankInfo = getPaymentMethodInfo(order.paymentMethod);

  const handleCopyOrder = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankInfo.accountNumber.replace(/[^0-9]/g, ''));
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  // Convert uploaded image file to data URL (compressed base64)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 2 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setProofPreview(result);
    };
    reader.readAsDataURL(file);
  };

  // Quick mock receipt for easy testing
  const handleUseMockReceipt = () => {
    // Generate a clean mock receipt SVG base64
    const svgReceipt = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none"><rect width="400" height="400" fill="%23f8fafc"/><rect x="20" y="20" width="360" height="360" rx="16" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><circle cx="200" cy="80" r="30" fill="%2310b981"/><path d="M190 80l7 7 15-15" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text x="200" y="140" font-family="sans-serif" font-size="18" font-weight="bold" fill="%230f172a" text-anchor="middle">BUKTI TRANSFER BERHASIL</text><text x="200" y="165" font-family="sans-serif" font-size="12" fill="%2364748b" text-anchor="middle">Bank: ${bankInfo.name}</text><text x="200" y="210" font-family="sans-serif" font-size="22" font-weight="bold" fill="%23047857" text-anchor="middle">Rp ${order.totalAmount.toLocaleString('id-ID')}</text><text x="200" y="245" font-family="sans-serif" font-size="12" fill="%23334155" text-anchor="middle">Ke: ${bankInfo.accountHolder}</text><text x="200" y="270" font-family="sans-serif" font-size="12" fill="%23334155" text-anchor="middle">No. Rek: ${bankInfo.accountNumber}</text><text x="200" y="310" font-family="sans-serif" font-size="11" fill="%2394a3b8" text-anchor="middle">Ref: ${order.orderNumber}</text><text x="200" y="340" font-family="sans-serif" font-size="10" fill="%2310b981" font-weight="bold" text-anchor="middle">STATUS: TRANSAKSI SUKSES</text></svg>`;
    setProofPreview(svgReceipt);
  };

  const handleSendProof = async () => {
    if (!proofPreview) {
      setErrorMsg('Pilih foto bukti transfer terlebih dahulu');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg('');
      await onSubmitProof(order.id, proofPreview);
      setUploadSuccess(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengunggah bukti');
    } finally {
      setIsUploading(false);
    }
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `Halo EcoAgro Store, saya telah membuat pesanan baru:\n\n*Nomor Pesanan:* ${order.orderNumber}\n*Nama:* ${order.customerName}\n*Total:* ${formatRupiah(order.totalAmount)}\n*Metode:* ${bankInfo.name}\n\nMohon dicek dan diproses ya. Terima kasih!`
    );
    window.open(`https://wa.me/6285600556628?text=${text}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-[#E8DEC8] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed at Top */}
        <div className="shrink-0 p-5 sm:p-6 bg-gradient-to-r from-[#1B4332] via-[#24523B] to-[#5C3D2E] text-white text-center relative border-b border-[#2D6A4F]">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2.5 shadow-inner">
            <CheckCircle className="w-7 h-7 text-emerald-300" />
          </div>
          <h2 className="text-lg sm:text-xl font-black">Pesanan Berhasil Dibuat!</h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Data pesanan telah tercatat di real-time database toko
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5 overscroll-contain">
          {/* Order Code Box */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-500 font-medium">Nomor Pesanan Anda:</span>
              <div className="text-base font-black text-gray-900 tracking-wide">
                {order.orderNumber}
              </div>
            </div>
            <button
              onClick={handleCopyOrder}
              className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedOrder ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedOrder ? 'Disalin' : 'Salin'}</span>
            </button>
          </div>

          {/* Payment Account */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase">
                  {bankInfo.name}
                </span>
                <div className="text-base font-black text-emerald-950 mt-0.5">
                  {bankInfo.accountNumber}
                </div>
                <div className="text-xs text-gray-600">
                  a.n. <b className="text-emerald-900">{bankInfo.accountHolder}</b>
                </div>
              </div>
              <button
                onClick={handleCopyAccount}
                className="p-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedAcc ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAcc ? 'Tersalin' : 'Salin Rekening'}</span>
              </button>
            </div>
            <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-600">Total yang harus ditransfer:</span>
              <span className="text-base font-black text-emerald-700">{formatRupiah(order.totalAmount)}</span>
            </div>
          </div>

          {/* Upload Proof Area */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-700" />
                Unggah Bukti Pembayaran
              </h4>
              <button
                type="button"
                onClick={handleUseMockReceipt}
                className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                Gunakan Struk Contoh
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {uploadSuccess || order.paymentProofUrl ? (
              <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Bukti transfer berhasil terkirim! Admin toko sedang memverifikasi pesanan Anda.</span>
              </div>
            ) : (
              <>
                <label className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <ImageIcon className="w-7 h-7 text-gray-400 mb-1" />
                  <span className="text-xs font-bold text-gray-700">Pilih Foto Struk / Screenshot Transfer</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Format JPG, PNG, atau WEBP (Maks 2MB)</span>
                </label>

                {proofPreview && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-gray-600">Pratinjau Bukti:</div>
                    <div className="w-full max-h-48 rounded-xl overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                      <img src={proofPreview} alt="Bukti Transfer" className="max-h-48 object-contain" />
                    </div>
                    <button
                      onClick={handleSendProof}
                      disabled={isUploading}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengirim Bukti...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Kirim Bukti ke Admin Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={openWhatsApp}
              className="py-2.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Konfirmasi via WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Tutup & Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
