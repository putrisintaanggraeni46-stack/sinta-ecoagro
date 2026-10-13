import React, { useState } from 'react';
import { X, Package, Clock, Truck, CheckCircle2, Upload, FileText, ChevronRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { Order, UserAccount } from '../types';
import { formatRupiah, formatDateIndo, getOrderStatusConfig, getPaymentMethodInfo, getCourierInfo } from '../utils/formatters';
import { InvoiceModal } from './admin/InvoiceModal';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  orders: Order[];
  onSubmitProof: (orderId: string, proofUrl: string) => Promise<void>;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  isOpen,
  onClose,
  user,
  orders,
  onSubmitProof,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [uploadProofFile, setUploadProofFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  // Filter orders by user id, email, or phone
  const userOrders = orders.filter((o) => {
    if (!user) return false;
    const cleanUserPhone = user.phone.replace(/[^0-9]/g, '');
    const cleanOrdPhone = o.customerPhone.replace(/[^0-9]/g, '');
    return (
      (o.customerId && o.customerId === user.id) ||
      (o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase()) ||
      (cleanUserPhone && cleanOrdPhone.includes(cleanUserPhone))
    );
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadProofFile(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedOrder || !uploadProofFile) return;
    try {
      setIsUploading(true);
      await onSubmitProof(selectedOrder.id, uploadProofFile);
      setSelectedOrder({
        ...selectedOrder,
        status: 'proof_submitted',
        paymentProofUrl: uploadProofFile,
      });
      setUploadProofFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E8DEC8] my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#1B4332] via-[#24523B] to-[#5C3D2E] text-white flex items-center justify-between border-b border-[#2D6A4F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2D6A4F] rounded-xl border border-[#52B788]/30">
              <ShoppingBag className="w-5 h-5 text-[#95D5B2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold">Riwayat Pesanan Saya</h2>
              <p className="text-xs text-[#D8F3DC]">
                {user ? `Akun: ${user.name}` : 'Daftar transaksi pesanan pertanian Anda'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {userOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Package className="w-12 h-12 text-[#8B5E3C]/40 mx-auto mb-3" />
              <h4 className="font-bold text-gray-800 text-sm">Belum Ada Transaksi</h4>
              <p className="text-xs text-[#78350F]/70 max-w-xs mx-auto mt-1">
                Anda belum melakukan pembelian. Silakan pilih benih, pupuk, atau peralatan tani dari etalase kami.
              </p>
            </div>
          ) : !selectedOrder ? (
            /* Order List */
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">
                Total {userOrders.length} Pesanan Terdata:
              </div>

              {userOrders.map((ord) => {
                const statusCfg = getOrderStatusConfig(ord.status);
                const bankInfo = getPaymentMethodInfo(ord.paymentMethod);
                const courierInfo = getCourierInfo(ord.shippingCourier);

                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="p-4 bg-[#FAF8F5] hover:bg-[#F4EFE6] border border-[#E8DEC8] hover:border-[#2D6A4F] rounded-2xl cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs sm:text-sm text-[#1B4332] group-hover:text-[#2D6A4F]">
                        {ord.orderNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.badgeClass}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#78350F]/70 flex items-center justify-between">
                      <span>{formatDateIndo(ord.createdAt)}</span>
                      <span className="font-semibold text-gray-700">{courierInfo.name}</span>
                    </div>

                    <div className="pt-2 border-t border-[#EAE0D0] flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        {ord.items.length} macam barang
                        {ord.discountAmount > 0 && (
                          <span className="ml-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
                            Diskon 10%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-[#1B4332]">
                          {formatRupiah(ord.totalAmount)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Order Detail */
            <div className="space-y-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-xs text-[#2D6A4F] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                ← Kembali ke daftar pesanan
              </button>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8DEC8] flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#8B5E3C] font-semibold">Nomor Pesanan:</div>
                  <div className="text-base font-black text-[#1B4332]">{selectedOrder.orderNumber}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{formatDateIndo(selectedOrder.createdAt)}</div>
                </div>

                <div className="text-right">
                  {(() => {
                    const cfg = getOrderStatusConfig(selectedOrder.status);
                    return (
                      <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full border ${cfg.badgeClass}`}>
                        {cfg.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Courier info */}
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-950 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold">
                  <Truck className="w-4 h-4 text-purple-700" />
                  Pengiriman: {getCourierInfo(selectedOrder.shippingCourier).name}
                </span>
                {selectedOrder.trackingNumber && (
                  <span className="font-mono font-black text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-200">
                    Resi: {selectedOrder.trackingNumber}
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="border border-[#E8DEC8] rounded-2xl p-4 bg-white space-y-2">
                <div className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider mb-2">Item Belanja:</div>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="font-bold text-[#1B4332]">{it.name}</div>
                      <div className="text-[10px] text-gray-500">{it.quantity} {it.unit} x {formatRupiah(it.price)}</div>
                    </div>
                    <span className="font-bold text-[#1B4332]">{formatRupiah(it.subtotal)}</span>
                  </div>
                ))}

                <div className="pt-2 border-t border-[#EAE0D0] space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatRupiah(selectedOrder.subtotalAmount || selectedOrder.totalAmount)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>{selectedOrder.discountReason || 'Potongan Diskon 10%:'}</span>
                      <span>-{formatRupiah(selectedOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm text-[#1B4332] pt-1 border-t border-gray-200">
                    <span>Total Pembayaran:</span>
                    <span>{formatRupiah(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Upload Proof if needed */}
              {selectedOrder.paymentMethod !== 'cod' && (
                <div className="p-4 bg-[#FAF8F5] border border-[#E8DEC8] rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#2D6A4F]" />
                    {selectedOrder.paymentProofUrl ? 'Bukti Transfer Sudah Diunggah:' : 'Unggah Bukti Transfer Sekarang:'}
                  </div>

                  {selectedOrder.paymentProofUrl ? (
                    <div className="space-y-2">
                      <img
                        src={selectedOrder.paymentProofUrl}
                        alt="Bukti Transfer"
                        className="max-h-36 rounded-xl border border-gray-200 object-contain bg-white"
                      />
                      <p className="text-[11px] text-emerald-800 font-semibold">
                        Bukti tersimpan. Admin Eco sedang memverifikasi pesanan Anda.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="text-xs text-gray-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2D6A4F] file:text-white hover:file:bg-[#1B4332] cursor-pointer"
                      />
                      {uploadProofFile && (
                        <div className="space-y-2">
                          <img src={uploadProofFile} alt="Preview" className="max-h-32 rounded-lg border object-contain bg-white" />
                          <button
                            onClick={handleUploadSubmit}
                            disabled={isUploading}
                            className="py-2 px-4 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            {isUploading ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Print Invoice Button */}
              <button
                onClick={() => setInvoiceOrder(selectedOrder)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Lihat & Cetak Nota Resmi</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
    </div>
  );
};
