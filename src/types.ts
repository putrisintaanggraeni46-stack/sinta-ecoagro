export type UserRole = 'admin' | 'customer';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  role: UserRole;
  totalOrders?: number;
  createdAt: string;
}

export type ProductCategory = 
  | 'Benih & Bibit Unggul' 
  | 'Pupuk, Nutrisi & Hayati' 
  | 'Pestisida & Proteksi Tanaman'
  | 'Alat, Mesin & Perlengkapan Tani'
  | 'Irigasi & Greenhouse'
  | 'Ternak, Wadah & Pasca Panen';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;              // Harga Jual ke Petani/Pelanggan
  buyPrice?: number;          // Harga Beli / HPP Modal dari Distributor
  profitRatio?: number;       // Rasio Profit Markup % (misal: 25%)
  sku?: string;               // Barcode / SKU Kasir
  stock: number;              // Stok fisik saat ini
  minStockAlert?: number;     // Ambang batas stok kritis (default 10)
  unit: string;               // Satuan (kg, liter, sak, botol, roll, unit)
  description: string;
  imageUrl: string;
  rating: number;
  soldCount: number;
  featured: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 
  | 'pending_payment'   // Menunggu Pembayaran
  | 'proof_submitted'   // Menunggu Approval Admin
  | 'processing'        // Pembayaran Disetujui / Sedang Diproses
  | 'shipped'           // Sedang Dikirim
  | 'completed'         // Pesanan Selesai / Selesai Kasir
  | 'cancelled';        // Dibatalkan / Bukti Ditolak

export type PaymentMethod = 
  | 'cash'              // Tunai / Kasir Cash
  | 'transfer_bca' 
  | 'transfer_mandiri' 
  | 'transfer_bri' 
  | 'qris'
  | 'cod'               // Bayar di Tempat
  | 'piutang';          // Bon / Tempo Petani

export type ShippingCourier = 
  | 'kurir_toko'        // Kurir Internal Toko EcoAgro
  | 'jne_kargo'         // JNE Trucking / Kargo Pertanian
  | 'ambil_gudang'      // Ambil Sendiri di Gudang
  | 'langsung_kasir';   // Transaksi Langsung di Toko (POS)

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  buyPrice?: number;
  sku?: string;
  quantity: number;
  unit: string;
  subtotal: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderSource?: 'pos' | 'online';  // Kasir Toko atau Pesanan Web
  cashierName?: string;
  customerId?: string;             // ID Pelanggan
  customerEmail?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  items: OrderItem[];
  subtotalAmount: number;
  discountAmount: number;
  discountReason?: string;
  systemDiscountAmount?: number;   // Potongan 10% sistem jika >= 1 Jt
  couponCode?: string;
  shippingCourier: ShippingCourier;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  cashPaidAmount?: number;         // Uang tunai diterima kasir
  cashChangeAmount?: number;       // Uang kembalian kasir
  totalCostAmount?: number;        // Total HPP Modal
  totalProfitAmount?: number;      // Total Laba Kotor Transaksi
  paymentProofUrl?: string;
  paymentProofDate?: string;
  adminNotes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface StockMutation {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  supplierName?: string;
  createdAt: string;
}
