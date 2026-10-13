import { OrderStatus, PaymentMethod, ShippingCourier } from '../types';

export const AUTO_DISCOUNT_THRESHOLD = 1000000; // Minimal 1 Juta Rupiah
export const AUTO_DISCOUNT_PERCENT = 10; // Diskon 10%

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export interface DiscountCalculation {
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  discountReason: string;
  qualifiesForAutoDiscount: boolean;
  remainingForAutoDiscount: number;
  finalTotal: number;
}

export function calculateCartDiscount(subtotal: number, couponCode?: string): DiscountCalculation {
  const cleanCoupon = (couponCode || '').trim().toUpperCase();
  const qualifiesForAuto = subtotal >= AUTO_DISCOUNT_THRESHOLD;
  const remaining = Math.max(0, AUTO_DISCOUNT_THRESHOLD - subtotal);

  let discountAmount = 0;
  let discountPercent = 0;
  let discountReason = '';

  if (qualifiesForAuto) {
    discountPercent = AUTO_DISCOUNT_PERCENT;
    discountAmount = Math.round(subtotal * (AUTO_DISCOUNT_PERCENT / 100));
    discountReason = `Diskon Otomatis ${AUTO_DISCOUNT_PERCENT}% (Belanja >= Rp 1.000.000)`;
  } else if (cleanCoupon === 'PANENRAYA') {
    discountPercent = 5;
    discountAmount = Math.round(subtotal * 0.05);
    discountReason = 'Kupon Promo Panen Raya (Diskon 5%)';
  } else if (cleanCoupon === 'ECOAGRO50' && subtotal >= 300000) {
    discountAmount = 50000;
    discountPercent = Math.round((50000 / subtotal) * 100);
    discountReason = 'Kupon Potongan Langsung Rp 50.000';
  }

  return {
    subtotal,
    discountAmount,
    discountPercent,
    discountReason,
    qualifiesForAutoDiscount: qualifiesForAuto,
    remainingForAutoDiscount: remaining,
    finalTotal: Math.max(0, subtotal - discountAmount),
  };
}

export interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export function getOrderStatusConfig(status: OrderStatus): StatusConfig {
  switch (status) {
    case 'pending_payment':
      return {
        label: 'Menunggu Pembayaran',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'proof_submitted':
      return {
        label: 'Menunggu Verifikasi Bukti',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
        dotClass: 'bg-blue-500',
      };
    case 'processing':
      return {
        label: 'Pembayaran Disetujui / Diproses',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'shipped':
      return {
        label: 'Pesanan Dikirim',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
        dotClass: 'bg-purple-500',
      };
    case 'completed':
      return {
        label: 'Pesanan Selesai',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        dotClass: 'bg-emerald-600',
      };
    case 'cancelled':
      return {
        label: 'Dibatalkan / Bukti Ditolak',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-gray-50 text-gray-700 border-gray-200',
        dotClass: 'bg-gray-500',
      };
  }
}

export interface BankAccountInfo {
  name: string;
  accountNumber: string;
  accountHolder: string;
  logoColor: string;
  instruction: string;
}

export function getPaymentMethodInfo(method: PaymentMethod): BankAccountInfo {
  switch (method) {
    case 'transfer_bca':
      return {
        name: 'Bank BCA',
        accountNumber: '8820-1928-33',
        accountHolder: 'ECOAGRO INDONESIA',
        logoColor: 'text-blue-700 bg-blue-50 border-blue-200',
        instruction: 'Transfer via ATM, BCA Mobile, atau KlikBCA',
      };
    case 'transfer_mandiri':
      return {
        name: 'Bank Mandiri',
        accountNumber: '137-00-2819283-1',
        accountHolder: 'ECOAGRO INDONESIA',
        logoColor: 'text-amber-900 bg-amber-50 border-amber-200',
        instruction: 'Transfer via Livin by Mandiri atau ATM Mandiri',
      };
    case 'transfer_bri':
      return {
        name: 'Bank BRI',
        accountNumber: '0122-01-003928-50-1',
        accountHolder: 'ECOAGRO INDONESIA',
        logoColor: 'text-blue-900 bg-sky-50 border-sky-200',
        instruction: 'Transfer via BRImo atau Agen BRILink terdekat',
      };
    case 'qris':
      return {
        name: 'QRIS Semua Bank / E-Wallet',
        accountNumber: 'NMID: ID1020261928371',
        accountHolder: 'ECOAGRO INDONESIA',
        logoColor: 'text-rose-700 bg-rose-50 border-rose-200',
        instruction: 'Scan pakai GoPay, OVO, Dana, ShopeePay, atau m-Banking',
      };
    case 'cod':
      return {
        name: 'COD (Bayar di Tempat)',
        accountNumber: 'TUNAI SAAT BARANG TIBA',
        accountHolder: 'KURIR ECOAGRO',
        logoColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
        instruction: 'Bayar tunai pas saat barang diterima di lokasi Anda',
      };
  }
}

export function getCourierInfo(courier: ShippingCourier): { name: string; fee: number; desc: string } {
  switch (courier) {
    case 'kurir_toko':
      return {
        name: 'Kurir Internal Toko EcoAgro',
        fee: 0,
        desc: 'Armada toko langsung ke lahan pertanian (Gratis Promo)',
      };
    case 'jne_kargo':
      return {
        name: 'JNE Trucking / Kargo Pertanian',
        fee: 0,
        desc: 'Pengiriman barang berat/sak pupuk antarkota (Gratis Promo)',
      };
    case 'ambil_gudang':
      return {
        name: 'Ambil Sendiri di Gudang EcoAgro',
        fee: 0,
        desc: 'Ambil langsung di Gudang Pusat EcoAgro tanpa antre',
      };
  }
}
