import React from 'react';
import { X, Printer, Sprout, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types';
import { formatRupiah, formatDateIndo, getPaymentMethodInfo } from '../../utils/formatters';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const bankInfo = getPaymentMethodInfo(order.paymentMethod);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls (Not printed) */}
        <div className="p-4 bg-gray-900 text-white flex items-center justify-between print:hidden">
          <span className="text-xs font-bold text-gray-300">Invoice Resmi Toko Pertanian</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Print Nota</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document */}
        <div className="p-8 text-gray-800 font-sans print:p-0">
          {/* Brand & Store Header */}
          <div className="flex items-start justify-between border-b-2 border-emerald-700 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center font-black">
                <Sprout className="w-7 h-7 text-[#95D5B2]" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-[#1B4332] tracking-tight">
                  ECOAGRO INDONESIA
                </h1>
                <p className="text-xs text-[#78350F]">Pusat Benih, Pupuk, Mesin & Alat Pertanian Modern</p>
                <p className="text-[11px] text-gray-500">Jl. Raya Agro Pertanian No. 88 | WA: 0812-3456-7890</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 px-2 py-0.5 bg-emerald-50 rounded">
                NOTA RESMI
              </span>
              <div className="text-sm font-black text-gray-900 mt-1">{order.orderNumber}</div>
              <div className="text-xs text-gray-500">{formatDateIndo(order.createdAt)}</div>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="grid grid-cols-2 gap-4 my-5 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Penerima / Petani:
              </span>
              <div className="font-extrabold text-gray-900 text-sm">{order.customerName}</div>
              <div className="text-gray-600 mt-0.5">WA: {order.customerPhone}</div>
              <div className="text-gray-500 mt-0.5 text-[11px] leading-tight">{order.customerAddress}</div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Informasi Pembayaran:
              </span>
              <div className="font-bold text-gray-900">{bankInfo.name}</div>
              <div className="text-gray-600">Rek: {bankInfo.accountNumber}</div>
              <div className="text-emerald-700 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Status: {order.status.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-xs text-left my-4 border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 uppercase text-[10px]">
                <th className="py-2 font-bold">Produk Pertanian</th>
                <th className="py-2 font-bold text-center">Qty</th>
                <th className="py-2 font-bold text-right">Harga Satuan</th>
                <th className="py-2 font-bold text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((it, idx) => (
                <tr key={idx} className="py-2">
                  <td className="py-2.5 font-medium text-gray-900">
                    <div>{it.name}</div>
                    <span className="text-[10px] text-gray-400">{it.unit}</span>
                  </td>
                  <td className="py-2.5 text-center font-bold text-gray-700">{it.quantity}</td>
                  <td className="py-2.5 text-right text-gray-600">{formatRupiah(it.price)}</td>
                  <td className="py-2.5 text-right font-bold text-gray-900">{formatRupiah(it.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={3} className="py-3 text-right font-bold text-gray-600">
                  Total Pembayaran:
                </td>
                <td className="py-3 text-right text-base font-black text-emerald-800">
                  {formatRupiah(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Notes & Stamp */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <div>
              <p>Terima kasih atas kepercayaan Anda bermitra dengan Toko Pertanian Makmur.</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Semoga hasil panen Anda melimpah & berkah selalu.</p>
            </div>
            <div className="text-center font-bold text-emerald-900 border-2 border-emerald-700/60 px-3 py-1.5 rounded-lg rotate-[-3deg]">
              LUNAS / VERIFIED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
