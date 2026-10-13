import React, { useState } from 'react';
import { X, Search, PackageCheck, Clock, CheckCircle2, AlertCircle, Upload, MessageSquare, Truck } from 'lucide-react';
import { Order } from '../types';
import { formatRupiah, formatDateIndo, getOrderStatusConfig, getPaymentMethodInfo } from '../utils/formatters';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onSubmitProof: (orderId: string, proofUrl: string) => Promise<void>;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSubmitProof,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Filter orders matching search term (by orderNumber or customerPhone)
  const matchedOrders = searchTerm.trim()
    ? orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
          o.customerPhone.replace(/[^0-9]/g, '').includes(searchTerm.replace(/[^0-9]/g, '').trim())
      )
    : [];

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setProofFile(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setProofFile(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedOrder || !proofFile) return;
    try {
      setIsSubmitting(true);
      await onSubmitProof(selectedOrder.id, proofFile);
      // Update local view
      setSelectedOrder({
        ...selectedOrder,
        status: 'proof_submitted',
        paymentProofUrl: proofFile,
      });
      setProofFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#1B4332] text-white flex items-center justify-between border-b border-[#2D6A4F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2D6A4F] rounded-xl border border-[#52B788]/30">
              <PackageCheck className="w-5 h-5 text-[#95D5B2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">Lacak Pesanan EcoAgro</h2>
              <p className="text-xs text-[#D8F3DC]">
                Cek status verifikasi pembayaran & jadwal pengiriman
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#2D6A4F] hover:bg-[#40916C] text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Ketik Nomor Pesanan (cth: ECO-202610-xxxx) atau Nomor WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Quick list of matching orders */}
          {searchTerm.trim() && matchedOrders.length > 0 && !selectedOrder && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-700">Ditemukan {matchedOrders.length} Pesanan:</div>
              {matchedOrders.map((ord) => {
                const statusCfg = getOrderStatusConfig(ord.status);
                return (
                  <div
                    key={ord.id}
                    onClick={() => handleSelectOrder(ord)}
                    className="p-3.5 bg-gray-50 hover:bg-emerald-50/70 border border-gray-200 hover:border-emerald-300 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-gray-900">{ord.orderNumber}</div>
                      <div className="text-[11px] text-gray-500">{ord.customerName} • {formatDateIndo(ord.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-700">{formatRupiah(ord.totalAmount)}</div>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.badgeClass}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {searchTerm.trim() && matchedOrders.length === 0 && (
            <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-semibold">Tidak ditemukan pesanan dengan kata kunci tersebut.</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Pastikan nomor pesanan atau nomor WhatsApp sudah benar.</p>
            </div>
          )}

          {/* Order Details View */}
          {selectedOrder && (
            <div className="space-y-4 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-xs text-emerald-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                ← Kembali ke hasil pencarian
              </button>

              {/* Status Header */}
              {(() => {
                const statusCfg = getOrderStatusConfig(selectedOrder.status);
                return (
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs text-emerald-800 font-semibold">Status Pesanan:</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${statusCfg.dotClass}`} />
                        <span className="text-sm font-black text-gray-900">{statusCfg.label}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Nomor Pesanan:</div>
                      <div className="text-sm font-black text-emerald-900">{selectedOrder.orderNumber}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Admin Note if any */}
              {selectedOrder.adminNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <span className="font-bold">Catatan Verifikasi Admin:</span> {selectedOrder.adminNotes}
                </div>
              )}

              {/* Tracking number if shipped */}
              {selectedOrder.trackingNumber && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Truck className="w-4 h-4 text-purple-600" />
                    Resi Pengiriman Kurir:
                  </span>
                  <span className="font-black text-purple-950 font-mono text-sm">{selectedOrder.trackingNumber}</span>
                </div>
              )}

              {/* Items List */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-2">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Item Belanja:</div>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="font-semibold text-gray-800">{item.name}</span>
                      <span className="text-gray-500 ml-1.5">x{item.quantity} {item.unit}</span>
                    </div>
                    <span className="font-black text-gray-900">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between text-sm font-black text-emerald-900 border-t border-gray-200">
                  <span>Total Tagihan:</span>
                  <span>{formatRupiah(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* If pending proof, allow uploading right now */}
              {(selectedOrder.status === 'pending_payment' || !selectedOrder.paymentProofUrl) && (
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-blue-700" />
                    Unggah Bukti Pembayaran Sekarang:
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-xs text-gray-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />

                  {proofFile && (
                    <div className="space-y-2">
                      <img src={proofFile} alt="Preview" className="max-h-32 rounded-lg border border-gray-200 object-contain bg-white" />
                      <button
                        onClick={handleUploadSubmit}
                        disabled={isSubmitting}
                        className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        {isSubmitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Proof Preview if already submitted */}
              {selectedOrder.paymentProofUrl && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                  <div className="text-xs font-bold text-gray-700">Bukti Pembayaran Terkirim:</div>
                  <img src={selectedOrder.paymentProofUrl} alt="Bukti Bayar" className="max-h-40 rounded-lg border border-gray-200 object-contain bg-white" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
