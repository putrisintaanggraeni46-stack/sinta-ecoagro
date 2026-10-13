import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Truck, 
  FileText, 
  Search, 
  Clock, 
  Check, 
  Image as ImageIcon, 
  AlertCircle,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatRupiah, formatDateIndo, getOrderStatusConfig, getPaymentMethodInfo } from '../../utils/formatters';
import { InvoiceModal } from './InvoiceModal';

interface OrderApprovalTabProps {
  orders: Order[];
  onApprovePayment: (orderId: string, notes?: string) => Promise<void>;
  onRejectPayment: (orderId: string, reason: string) => Promise<void>;
  onUpdateStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => Promise<void>;
}

export const OrderApprovalTab: React.FC<OrderApprovalTabProps> = ({
  orders,
  onApprovePayment,
  onRejectPayment,
  onUpdateStatus,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewProofOrder, setPreviewProofOrder] = useState<Order | null>(null);
  const [rejectPromptOrder, setRejectPromptOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('Bukti transfer tidak jelas / nominal tidak sesuai.');
  const [shippingPromptOrder, setShippingPromptOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Status counters
  const proofPendingCount = orders.filter((o) => o.status === 'proof_submitted').length;
  const processingCount = orders.filter((o) => o.status === 'processing').length;

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedFilter === 'all' || o.status === selectedFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const handleApprove = async (orderId: string) => {
    try {
      setIsProcessing(true);
      await onApprovePayment(orderId, 'Pembayaran terverifikasi valid oleh Admin');
      setPreviewProofOrder(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectPromptOrder) return;
    try {
      setIsProcessing(true);
      await onRejectPayment(rejectPromptOrder.id, rejectReason);
      setRejectPromptOrder(null);
      setPreviewProofOrder(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmShipping = async () => {
    if (!shippingPromptOrder) return;
    try {
      setIsProcessing(true);
      await onUpdateStatus(shippingPromptOrder.id, 'shipped', trackingNumber || 'JNE-TANI-2026');
      setShippingPromptOrder(null);
      setTrackingNumber('');
    } finally {
      setIsProcessing(false);
    }
  };

  const openWhatsAppCustomer = (order: Order) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const phone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const msg = encodeURIComponent(
      `Halo Bapak/Ibu ${order.customerName}, kami dari EcoAgro Store mengonfirmasi pesanan Anda #${order.orderNumber} dengan total ${formatRupiah(order.totalAmount)}. Status saat ini: ${order.status.toUpperCase()}.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Top Filter & Metrics */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari nomor pesanan, nama pembeli, atau no WA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            {proofPendingCount > 0 && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-xl border border-blue-200 animate-pulse flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{proofPendingCount} Butuh Approval</span>
              </span>
            )}
            <span className="text-gray-500 text-xs">Total {orders.length} Pesanan</span>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'Semua Pesanan' },
            { id: 'proof_submitted', label: `Menunggu Approval (${proofPendingCount})` },
            { id: 'pending_payment', label: 'Menunggu Bayar' },
            { id: 'processing', label: `Diproses (${processingCount})` },
            { id: 'shipped', label: 'Dikirim' },
            { id: 'completed', label: 'Selesai' },
            { id: 'cancelled', label: 'Dibatalkan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedFilter === tab.id
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Nomor & Tanggal</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Item Belanja</th>
                <th className="py-3 px-4">Total & Bank</th>
                <th className="py-3 px-4">Bukti Bayar</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Approval & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Tidak ada data pesanan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const statusCfg = getOrderStatusConfig(ord.status);
                  const bankInfo = getPaymentMethodInfo(ord.paymentMethod);
                  const isProofSubmitted = ord.status === 'proof_submitted';

                  return (
                    <tr 
                      key={ord.id} 
                      className={`hover:bg-gray-50/70 transition-colors ${
                        isProofSubmitted ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {/* Order Number & Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-gray-900">{ord.orderNumber}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{formatDateIndo(ord.createdAt)}</div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{ord.customerName}</div>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-0.5">
                          <span>{ord.customerPhone}</span>
                          <button
                            onClick={() => openWhatsAppCustomer(ord)}
                            title="Chat via WhatsApp"
                            className="p-0.5 text-green-600 hover:text-green-700 cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[10px] text-gray-400 line-clamp-1 max-w-xs">{ord.customerAddress}</div>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 max-w-xs">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="text-[11px] text-gray-700 truncate">
                              • {it.name} <span className="text-gray-400">({it.quantity} {it.unit})</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total & Bank */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-black text-gray-900 text-xs sm:text-sm">
                          {formatRupiah(ord.totalAmount)}
                        </div>
                        <div className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                          {bankInfo.name}
                        </div>
                      </td>

                      {/* Bukti Bayar Preview button */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {ord.paymentProofUrl ? (
                          <button
                            onClick={() => setPreviewProofOrder(ord)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Lihat Bukti</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Belum diunggah</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* If proof submitted, show quick approve/reject */}
                          {isProofSubmitted && (
                            <>
                              <button
                                onClick={() => handleApprove(ord.id)}
                                title="Setujui Pembayaran"
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>Setujui</span>
                              </button>
                              <button
                                onClick={() => { setRejectPromptOrder(ord); }}
                                title="Tolak Pembayaran"
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Tolak</span>
                              </button>
                            </>
                          )}

                          {/* If processing, show button to Ship */}
                          {ord.status === 'processing' && (
                            <button
                              onClick={() => { setShippingPromptOrder(ord); setTrackingNumber(`EXP-${Date.now().toString().slice(-6)}`); }}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Truck className="w-3 h-3" />
                              <span>Kirimkan</span>
                            </button>
                          )}

                          {/* If shipped, show button to mark Completed */}
                          {ord.status === 'shipped' && (
                            <button
                              onClick={() => onUpdateStatus(ord.id, 'completed')}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Selesai</span>
                            </button>
                          )}

                          {/* Invoice Print Button */}
                          <button
                            onClick={() => setInvoiceOrder(ord)}
                            title="Cetak Nota"
                            className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Preview Modal */}
      {previewProofOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm">Verifikasi Bukti Transfer</h3>
                <p className="text-[11px] text-emerald-200">
                  {previewProofOrder.orderNumber} • {formatRupiah(previewProofOrder.totalAmount)}
                </p>
              </div>
              <button
                onClick={() => setPreviewProofOrder(null)}
                className="p-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="w-full max-h-80 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-2">
                <img
                  src={previewProofOrder.paymentProofUrl}
                  alt="Bukti Transfer"
                  className="max-h-76 object-contain rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[10px]">Pembeli:</span>
                  <span className="font-bold text-gray-900">{previewProofOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Metode Pembayaran:</span>
                  <span className="font-bold text-emerald-800">
                    {getPaymentMethodInfo(previewProofOrder.paymentMethod).name}
                  </span>
                </div>
              </div>

              {/* Action buttons inside proof preview */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  onClick={() => { setRejectPromptOrder(previewProofOrder); }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                >
                  Tolak Bukti Transfer
                </button>
                <button
                  onClick={() => handleApprove(previewProofOrder.id)}
                  disabled={isProcessing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Setujui Pembayaran (Approve)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Prompt Modal */}
      {rejectPromptOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-black text-base text-gray-900">Konfirmasi Penolakan Bukti Bayar</h3>
            <p className="text-xs text-gray-600">
              Pesanan #{rejectPromptOrder.orderNumber} akan diubah statusnya menjadi Dibatalkan / Bukti Ditolak.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Alasan Penolakan:
              </label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectPromptOrder(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Tolak Pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Resi Prompt Modal */}
      {shippingPromptOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" />
              Kirim Pesanan #{shippingPromptOrder.orderNumber}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nomor Resi / Kurir Pengiriman:
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Contoh: JNE-TANI-882910 atau Kurir Toko Armada 1"
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-purple-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShippingPromptOrder(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmShipping}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Simpan & Tandai Dikirim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
    </div>
  );
};
