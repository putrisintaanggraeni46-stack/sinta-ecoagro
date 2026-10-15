import { OrderStatus, PaymentMethod, ShippingCourier } from '../types';

export const AUTO_DISCOUNT_THRESHOLD = 1000000; // Minimal 1 Juta Rupiah (Diskon Sistem 10%)
export const AUTO_DISCOUNT_PERCENT = 10; // Diskon 10% dari sistem

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
  systemDiscountPercent: number;
  systemDiscountAmount: number;
  subtotalAfterSystem: number;
  couponDiscountAmount: number;
  discountAmount: number;       // Total potongan gabungan
  discountPercent: number;      // Persentase efektif
  discountReason: string;
  breakdownReasons: string[];
  qualifiesForAutoDiscount: boolean;
  remainingForAutoDiscount: number;
  finalTotal: number;
}

/**
 * Menghitung diskon toko:
 * - Jika belanja >= 1 jt: dipotong 10% otomatis oleh sistem.
 * - Diskon kupon opsional (PANENRAYA / ECOAGRO50).
 */
export function calculateCartDiscount(
  subtotal: number, 
  couponCode?: string
): DiscountCalculation {
  const cleanCoupon = (couponCode || '').trim().toUpperCase();
  const qualifiesForAuto = subtotal >= AUTO_DISCOUNT_THRESHOLD;
  const remaining = Math.max(0, AUTO_DISCOUNT_THRESHOLD - subtotal);

  let systemDiscountPercent = 0;
  let systemDiscountAmount = 0;
  let couponDiscountAmount = 0;
  const breakdownReasons: string[] = [];

  // 1. Potongan 10% oleh Sistem jika belanja >= 1 Juta
  if (qualifiesForAuto) {
    systemDiscountPercent = AUTO_DISCOUNT_PERCENT;
    systemDiscountAmount = Math.round(subtotal * (AUTO_DISCOUNT_PERCENT / 100));
    breakdownReasons.push(`Diskon 10% (Belanja ≥ 1 Jt): -${formatRupiah(systemDiscountAmount)}`);
  }

  const subtotalAfterSystem = Math.max(0, subtotal - systemDiscountAmount);

  // 2. Kupon Tambahan jika ada
  if (cleanCoupon === 'PANENRAYA') {
    couponDiscountAmount = Math.round(subtotalAfterSystem * 0.05);
    breakdownReasons.push(`Kupon PANENRAYA (5%): -${formatRupiah(couponDiscountAmount)}`);
  } else if (cleanCoupon === 'ECOAGRO50' && subtotal >= 300000) {
    couponDiscountAmount = Math.min(subtotalAfterSystem, 50000);
    breakdownReasons.push(`Kupon ECOAGRO50: -${formatRupiah(couponDiscountAmount)}`);
  }

  const totalDiscount = systemDiscountAmount + couponDiscountAmount;
  const effectivePercent = subtotal > 0 ? Math.round((totalDiscount / subtotal) * 100) : 0;

  let combinedReason = '';
  if (systemDiscountAmount > 0 && couponDiscountAmount > 0) {
    combinedReason = 'Diskon 10% (≥ 1 Jt) + Kupon Promo';
  } else if (systemDiscountAmount > 0) {
    combinedReason = 'Diskon Otomatis 10% (Belanja ≥ 1 Jt)';
  } else if (couponDiscountAmount > 0) {
    combinedReason = 'Potongan Kupon Promo';
  }

  return {
    subtotal,
    systemDiscountPercent,
    systemDiscountAmount,
    subtotalAfterSystem,
    couponDiscountAmount,
    discountAmount: totalDiscount,
    discountPercent: effectivePercent,
    discountReason: combinedReason,
    breakdownReasons,
    qualifiesForAutoDiscount: qualifiesForAuto,
    remainingForAutoDiscount: remaining,
    finalTotal: Math.max(0, subtotal - totalDiscount),
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
    case 'cash':
      return {
        name: 'Tunai Kasir (Cash)',
        accountNumber: 'KASIR TOKO ECOAGRO',
        accountHolder: 'KASIR ECOAGRO',
        logoColor: 'text-[#1B4332] bg-[#D8F3DC] border-[#74C69D]',
        instruction: 'Pembayaran tunai langsung di meja kasir toko',
      };
    case 'piutang':
      return {
        name: 'Bon / Tempo Petani',
        accountNumber: 'PIUTANG KELOMPOK TANI',
        accountHolder: 'ECOAGRO KREDIT TANI',
        logoColor: 'text-[#78350F] bg-[#FEF3C7] border-[#FDE68A]',
        instruction: 'Dicatat sebagai piutang jatuh tempo panen petani',
      };
    case 'cod':
    default:
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
    case 'langsung_kasir':
    default:
      return {
        name: 'Bawa Langsung dari Kasir Toko',
        fee: 0,
        desc: 'Barang langsung diserahkan di meja kasir EcoAgro',
      };
  }
}
