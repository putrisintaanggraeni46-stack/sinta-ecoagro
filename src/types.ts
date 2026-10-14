export type UserRole = 'admin' | 'customer';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  role: UserRole;
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
  price: number;              // Harga Jual Konsumen
  costPrice?: number;         // Harga Beli / Modal Supplier (HPP)
  profitRatio?: number;       // Rasio Profit (%) dari Harga Beli
  profitNominal?: number;     // Estimasi Laba per unit (price - costPrice)
  barcode?: string;           // Kode Barcode / SKU Kasir untuk quick scan
  stock: number;
  minStockAlert?: number;     // Ambang batas stok kritis (default 10)
  unit: string;
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
  | 'completed'         // Pesanan Selesai
  | 'cancelled';        // Dibatalkan / Bukti Ditolak

export type PaymentMethod = 
  | 'transfer_bca' 
  | 'transfer_mandiri' 
  | 'transfer_bri' 
  | 'qris'
  | 'cod'               // Bayar di Tempat
  | 'cash'              // Tunai Kasir POS
  | 'debt';             // Hutang / Bon Petani (Tempo)

export type ShippingCourier = 
  | 'kurir_toko'        // Kurir Internal Toko EcoAgro
  | 'jne_kargo'         // JNE Trucking / Kargo Pertanian
  | 'ambil_gudang';     // Ambil Sendiri di Gudang

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  costPrice?: number;   // Modal untuk pencatatan margin POS
  quantity: number;
  unit: string;
  subtotal: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;  // ID Pelanggan terdaftar
  customerEmail?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  items: OrderItem[];
  subtotalAmount: number;
  discountAmount: number;
  discountReason?: string;
  couponCode?: string;
  shippingCourier: ShippingCourier;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentProofUrl?: string;
  paymentProofDate?: string;
  adminNotes?: string;
  trackingNumber?: string;
  source?: 'pos' | 'webstore'; // Sumber transaksi (POS Kasir fisik vs Webstore online)
  cashReceived?: number;       // Nominal uang tunai diterima di kasir
  cashChange?: number;         // Uang kembalian kasir
  cashierName?: string;        // Nama staf/admin kasir
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
