import React, { useRef } from 'react';
import { X, Printer, Share2, CheckCircle2, Sprout, ArrowRight } from 'lucide-react';
import { Order } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';
import { EcoAgroLogo } from '../EcoAgroLogo';

interface PosReceiptModalProps {
  order: Order | null;
  onClose: () => void;
  onNewTransaction: () => void;
}

export const PosReceiptModal: React.FC<PosReceiptModalProps> = ({
  order,
  onClose,
  onNewTransaction,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReceiptText = () => {
    const lines = [
      '================================',
      '      ECOAGRO STORE INDONESIA   ',
      ' Solusi Pertanian & Alat Tani Modern',
      '   WhatsApp CS: 085600556628    ',
      '================================',
      `No. Struk : ${order.orderNumber}`,
      `Tanggal   : ${formatDateIndo(order.createdAt)}`,
      `Kasir     : ${order.cashierName || 'Admin Eco'}`,
      `Pelanggan : ${order.customerName || 'Pelanggan Toko'}`,
      '--------------------------------',
      ...order.items.map(
        (it) => `${it.name.slice(0, 24)}\n  ${it.quantity} x ${formatRupiah(it.price)} = ${formatRupiah(it.subtotal)}`
      ),
      '--------------------------------',
      `Subtotal  : ${formatRupiah(order.subtotalAmount)}`,
      order.systemDiscountAmount && order.systemDiscountAmount > 0
        ? `Diskon 10% (≥ 1 Jt) : -${formatRupiah(order.systemDiscountAmount)}`
        : '',
      order.discountAmount > 0 && !order.systemDiscountAmount
        ? `Diskon : -${formatRupiah(order.discountAmount)}`
        : '',
      `TOTAL     : ${formatRupiah(order.totalAmount)}`,
      `Metode    : ${order.paymentMethod.toUpperCase()}`,
      order.cashPaidAmount ? `Bayar     : ${formatRupiah(order.cashPaidAmount)}` : '',
      order.cashChangeAmount ? `Kembalian : ${formatRupiah(order.cashChangeAmount)}` : '',
      '================================',
      ' Terima kasih atas kunjungan Anda ',
      '  Semoga Panen Berkah & Melimpah ',
      '================================',
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E8DEC8] my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal Bar */}
        <div className="p-4 bg-[#1B4332] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#74C69D]" />
            <span className="font-extrabold text-sm">Transaksi Kasir Berhasil!</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Thermal Receipt Area */}
        <div className="p-6 bg-[#FAF8F5] overflow-y-auto max-h-[70vh]">
          <div 
            ref={receiptRef}
            className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DEC8] font-mono text-xs text-[#2D2A26] space-y-4"
          >
            {/* Store Branding */}
            <div className="text-center border-b border-dashed border-[#D5C7B0] pb-3 space-y-1">
              <div className="flex justify-center mb-1">
                <EcoAgroLogo size="sm" showText={false} />
              </div>
              <div className="text-base font-black text-[#1B4332]">ECOAGRO STORE</div>
              <p className="text-[10px] text-[#78350F]">Pusat Sarana & Prasarana Pertanian</p>
              <p className="text-[10px] text-gray-500">Jl. Pertanian Makmur • WA: 085600556628</p>
            </div>

            {/* Transaction Metadata */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-[#D5C7B0] pb-3">
              <div className="flex justify-between">
                <span className="text-gray-500">No. Bukti:</span>
                <span className="font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Waktu:</span>
                <span>{formatDateIndo(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kasir:</span>
                <span className="font-semibold">{order.cashierName || 'Admin Eco'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pelanggan:</span>
                <span className="font-semibold">
                  {order.customerName || 'Pelanggan Umum'}
                </span>
              </div>
            </div>

            {/* Purchased Items */}
            <div className="space-y-2 border-b border-dashed border-[#D5C7B0] pb-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-gray-900 leading-tight">{item.name}</div>
                  <div className="flex justify-between text-[11px] text-gray-600">
                    <span>
                      {item.quantity} {item.unit} x {formatRupiah(item.price)}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {item.price === 0 ? 'GRATIS' : formatRupiah(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations & Totals */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({order.items.length} item):</span>
                <span>{formatRupiah(order.subtotalAmount)}</span>
              </div>

              {order.systemDiscountAmount !== undefined && order.systemDiscountAmount > 0 && (
                <div className="flex justify-between text-[#1B4332] font-bold bg-[#D8F3DC] px-2 py-0.5 rounded">
                  <span>Diskon 10% (≥ 1 Jt):</span>
                  <span>-{formatRupiah(order.systemDiscountAmount)}</span>
                </div>
              )}

              {order.discountAmount > 0 && !order.systemDiscountAmount && (
                <div className="flex justify-between text-[#1B4332] font-bold bg-[#D8F3DC] px-2 py-0.5 rounded">
                  <span>Potongan Diskon:</span>
                  <span>-{formatRupiah(order.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-[#1B4332] pt-2 border-t border-dashed border-[#D5C7B0]">
                <span>TOTAL BELANJA:</span>
                <span>{formatRupiah(order.totalAmount)}</span>
              </div>

              <div className="flex justify-between text-gray-600 pt-1">
                <span>Metode Bayar:</span>
                <span className="font-bold uppercase">{order.paymentMethod.replace('_', ' ')}</span>
              </div>

              {order.cashPaidAmount !== undefined && order.cashPaidAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tunai Diterima:</span>
                  <span>{formatRupiah(order.cashPaidAmount)}</span>
                </div>
              )}

              {order.cashChangeAmount !== undefined && order.cashChangeAmount > 0 && (
                <div className="flex justify-between text-[#2D6A4F] font-bold">
                  <span>Kembalian:</span>
                  <span>{formatRupiah(order.cashChangeAmount)}</span>
                </div>
              )}
            </div>

            {/* Footer Blessing */}
            <div className="text-center pt-3 border-t border-dashed border-[#D5C7B0] text-[10px] text-gray-500 space-y-1">
              <p className="font-bold text-[#1B4332]">TERIMA KASIH TELAH BERBELANJA</p>
              <p>Semoga hasil panen berlimpah & pertanian makmur!</p>
              <p className="text-[9px] text-[#78350F]/70">Struk resmi tersimpan di sistem cloud EcoAgro</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-white border-t border-[#E8DEC8] flex flex-col sm:flex-row gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-[#74C69D]" />
            <span>Cetak Struk (Print)</span>
          </button>

          <button
            onClick={handleCopyReceiptText}
            className="flex-1 py-2.5 px-3 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border border-[#FDE68A] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Share2 className="w-4 h-4 text-[#D97706]" />
            <span>{copied ? 'Tersalin!' : 'Salin Teks WA'}</span>
          </button>

          <button
            onClick={onNewTransaction}
            className="py-2.5 px-4 bg-[#8B5E3C] hover:bg-[#78350F] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <span>Transaksi Baru</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
