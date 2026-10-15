import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Barcode, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  DollarSign, 
  Percent, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  User, 
  Printer, 
  TrendingUp, 
  RotateCcw, 
  ArrowRight, 
  ShieldCheck, 
  Coins, 
  CreditCard, 
  QrCode, 
  Package, 
  Clock, 
  Receipt,
  Warehouse
} from 'lucide-react';
import { Product, ProductCategory, Order, Customer, PaymentMethod } from '../../types';
import { 
  formatRupiah, 
  AUTO_DISCOUNT_THRESHOLD,
  calculateCartDiscount
} from '../../utils/formatters';
import { getProductBuyPrice, getProductProfitRatio, getProductSku, calculateProfitMetrics } from '../../utils/pricingUtils';
import { PosReceiptModal } from './PosReceiptModal';

interface PosCartItem {
  product: Product;
  quantity: number;
  customPrice?: number;
}

interface PosKasirTabProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  onCreateOrder: (order: Omit<Order, 'id'>) => Promise<string>;
  onOpenInventory: () => void;
  onOpenPricing: () => void;
}

export const PosKasirTab: React.FC<PosKasirTabProps> = ({
  products,
  orders,
  customers,
  onCreateOrder,
  onOpenInventory,
  onOpenPricing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Semua'>('Semua');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [customerName, setCustomerName] = useState('Pelanggan Umum');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [additionalDiscount, setAdditionalDiscount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentCompletedOrder, setRecentCompletedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const categories: (ProductCategory | 'Semua')[] = [
    'Semua',
    'Benih & Bibit Unggul',
    'Pupuk, Nutrisi & Hayati',
    'Pestisida & Proteksi Tanaman',
    'Alat, Mesin & Perlengkapan Tani',
    'Irigasi & Greenhouse',
    'Ternak, Wadah & Pasca Panen',
  ];

  // Quick Stats Hari Ini
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPosOrders = orders.filter((o) => o.createdAt.startsWith(todayStr) && o.orderSource === 'pos');
  const todayPosRevenue = todayPosOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const sku = getProductSku(p);
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Add Item to Cart
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert(`Stok produk "${product.name}" sudah habis di gudang!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Jumlah melebihi stok yang tersedia (${product.stock} ${product.unit})`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Barcode / SKU Scanner Handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim().toUpperCase();
    if (!query) return;

    const found = products.find((p) => {
      const sku = getProductSku(p).toUpperCase();
      return sku === query || sku.includes(query) || p.name.toUpperCase().includes(query);
    });

    if (found) {
      handleAddToCart(found);
      setScanMessage(`Berhasil scan: ${found.name}`);
      setBarcodeInput('');
      setTimeout(() => setScanMessage(null), 3000);
    } else {
      setScanMessage(`Produk dengan SKU/Kode "${query}" tidak ditemukan`);
      setTimeout(() => setScanMessage(null), 3000);
    }
  };

  // Update Cart Quantity
  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) {
              alert(`Jumlah melebihi stok tersedia (${item.product.stock} ${item.product.unit})`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as PosCartItem[]
    );
  };

  // Remove Cart Item
  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Customer Matching
  const matchingCustomer = useMemo(() => {
    const cleanP = customerPhone.replace(/[^0-9]/g, '');
    return customers.find((c) => {
      const custCleanP = c.phone.replace(/[^0-9]/g, '');
      return (
        (cleanP.length >= 8 && custCleanP === cleanP) ||
        (customerName.trim() && c.name.toLowerCase() === customerName.trim().toLowerCase())
      );
    });
  }, [customers, customerPhone, customerName]);

  // Calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalCost = cart.reduce((sum, item) => sum + getProductBuyPrice(item.product) * item.quantity, 0);

  // Automatic Store Discount (10% on >= 1 Juta)
  const discountInfo = calculateCartDiscount(rawSubtotal);
  const totalDiscount = discountInfo.discountAmount + (additionalDiscount || 0);
  const finalTotal = Math.max(0, rawSubtotal - totalDiscount);
  const totalProfit = Math.max(0, finalTotal - totalCost);

  // Cash Change Calculation
  const numericCash = Number(cashGiven) || 0;
  const cashChange = paymentMethod === 'cash' ? Math.max(0, numericCash - finalTotal) : 0;
  const isCashInsufficient = paymentMethod === 'cash' && numericCash > 0 && numericCash < finalTotal;

  // Process POS Transaction
  const handleProcessTransaction = async () => {
    if (cart.length === 0) {
      alert('Keranjang kasir masih kosong');
      return;
    }

    if (paymentMethod === 'cash' && numericCash < finalTotal) {
      alert(`Uang tunai yang dibayarkan kurang Rp ${formatRupiah(finalTotal - numericCash)}`);
      return;
    }

    try {
      setIsProcessing(true);
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `POS-${datePart}-${randomSuffix}`;

      const orderItems = cart.map((ci) => ({
        productId: ci.product.id,
        name: ci.product.name,
        sku: getProductSku(ci.product),
        price: ci.product.price,
        buyPrice: getProductBuyPrice(ci.product),
        quantity: ci.quantity,
        unit: ci.product.unit,
        subtotal: ci.product.price * ci.quantity,
        imageUrl: ci.product.imageUrl || '',
      }));

      const orderPayload: Omit<Order, 'id'> = {
        orderNumber,
        orderSource: 'pos',
        cashierName: 'Admin Eco Kasir',
        customerId: matchingCustomer?.id || 'guest',
        customerEmail: matchingCustomer?.email || '',
        customerName: customerName.trim() || 'Pelanggan Toko',
        customerPhone: customerPhone.trim() || '085600556628',
        customerAddress: 'Transaksi Langsung di Toko EcoAgro',
        notes: notes.trim() || 'Penjualan Langsung di Kasir Toko',
        items: orderItems,
        subtotalAmount: rawSubtotal,
        discountAmount: totalDiscount,
        discountReason: discountInfo.discountReason || (additionalDiscount > 0 ? 'Diskon Manual Kasir' : ''),
        systemDiscountAmount: discountInfo.systemDiscountAmount || 0,
        couponCode: '',
        shippingCourier: 'langsung_kasir',
        shippingFee: 0,
        totalAmount: finalTotal,
        status: 'completed', // Langsung selesai karena transaksi langsung di kasir
        paymentMethod,
        cashPaidAmount: paymentMethod === 'cash' ? numericCash : finalTotal,
        cashChangeAmount: cashChange,
        totalCostAmount: totalCost,
        totalProfitAmount: totalProfit,
        paymentProofUrl: '',
        paymentProofDate: '',
        adminNotes: 'Transaksi Kasir POS Berhasil',
        trackingNumber: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newId = await onCreateOrder(orderPayload);
      const createdOrder: Order = {
        ...orderPayload,
        id: newId,
      };

      setRecentCompletedOrder(createdOrder);
      setIsReceiptOpen(true);
      setCart([]);
      setCashGiven('');
      setNotes('');
      setAdditionalDiscount(0);
    } catch (err: unknown) {
      console.error(err);
      alert('Gagal memproses transaksi kasir: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Kasir Top Banner / Stats */}
      <div className="bg-gradient-to-r from-[#1B4332] via-[#24523B] to-[#5C3D2E] text-white p-4 sm:p-5 rounded-3xl shadow-md border border-[#74C69D]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#F59E0B]/20 border border-[#F59E0B]/40 px-3 py-1 rounded-full text-xs font-bold text-[#FDE68A] mb-1">
            <Coins className="w-3.5 h-3.5 text-[#F59E0B]" />
            Sistem Kasir PoS Toko Fisik Pertanian
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Terminal Kasir EcoAgro</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#2D6A4F] text-[#D8F3DC] border border-[#74C69D]/40">
              Live Stock
            </span>
          </h2>
          <p className="text-xs text-[#D8F3DC]/80 mt-0.5">
            Pencatatan transaksi kasir instan, auto potong stok gudang, dan kalkulasi profit modal secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-2.5 rounded-2xl text-left min-w-32">
            <div className="text-[10px] text-[#FEF3C7] font-semibold uppercase">Kasir Hari Ini</div>
            <div className="text-base font-black text-white">{todayPosOrders.length} Struk</div>
            <div className="text-[10px] text-[#95D5B2]">{formatRupiah(todayPosRevenue)}</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onOpenPricing}
              className="px-3 py-2 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Atur rasio profit dan harga jual dari harga beli"
            >
              <TrendingUp className="w-4 h-4 text-[#D97706]" />
              <span className="hidden sm:inline">Pengaturan Harga</span>
            </button>
            <button
              onClick={onOpenInventory}
              className="px-3 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-[#52B788]/40 shadow-xs transition-colors"
              title="Buka data gudang dan mutasi stok"
            >
              <Warehouse className="w-4 h-4 text-[#74C69D]" />
              <span className="hidden sm:inline">Gudang & Stok</span>
            </button>
          </div>
        </div>
      </div>

      {/* POS Main Grid: 2 Kolom (Kiri: Katalog Produk & Scan, Kanan: Keranjang Kasir & Pembayaran) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* KOLOM KIRI (7/12): Barcode Scanner & Katalog Cepat */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Quick Barcode / SKU Scan Input */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#E8DEC8] shadow-xs">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Scan barcode / ketik SKU (contoh: ECO-BNH-001) atau nama barang..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F] font-mono"
                />
                <Barcode className="w-4 h-4 text-[#8B5E3C] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
              >
                <span>Cari / Scan</span>
              </button>
            </form>

            {scanMessage && (
              <div className="mt-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#D8F3DC] text-[#1B4332] flex items-center gap-1.5 animate-in fade-in">
                <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>{scanMessage}</span>
              </div>
            )}
          </div>

          {/* Search & Category Tabs */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#E8DEC8] shadow-xs space-y-2.5">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari benih, pupuk NPK, pestisida, cangkul..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F]"
              />
              <Search className="w-4 h-4 text-[#8B5E3C] absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1B4332] text-white shadow-xs'
                        : 'bg-[#F4EFE6] text-[#4A3E31] hover:bg-[#EAE0D0] border border-[#E8DEC8]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[580px] overflow-y-auto p-1">
            {filteredProducts.map((p) => {
              const sku = getProductSku(p);
              const buyPrice = getProductBuyPrice(p);
              const profitRatio = getProductProfitRatio(p);
              const profitMetric = calculateProfitMetrics(p.price, buyPrice);
              const isLowStock = p.stock > 0 && p.stock <= (p.minStockAlert || 10);
              const isOutOfStock = p.stock <= 0;

              return (
                <div
                  key={p.id}
                  onClick={() => !isOutOfStock && handleAddToCart(p)}
                  className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isOutOfStock
                      ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                      : 'bg-white border-[#E8DEC8] hover:border-[#2D6A4F] hover:shadow-md cursor-pointer group active:scale-[0.98]'
                  }`}
                >
                  <div>
                    {/* Thumbnail & Badges */}
                    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 mb-2">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {/* SKU Badge */}
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px] font-bold">
                        {sku}
                      </span>

                      {/* Stock Badge */}
                      <span
                        className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                          isOutOfStock
                            ? 'bg-rose-600 text-white'
                            : isLowStock
                            ? 'bg-amber-500 text-white'
                            : 'bg-[#2D6A4F] text-white'
                        }`}
                      >
                        {isOutOfStock ? 'HABIS' : `Stok: ${p.stock}`}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">
                      {p.name}
                    </h4>
                    <div className="text-[10px] text-[#78350F]/70 truncate">{p.unit}</div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#FAF8F5]">
                    <div className="text-xs font-extrabold text-[#1B4332]">
                      {formatRupiah(p.price)}
                    </div>
                    {/* Profit indicator */}
                    <div className="flex items-center justify-between text-[9px] text-gray-500 mt-0.5">
                      <span>Modal: {formatRupiah(buyPrice)}</span>
                      <span className="font-bold text-[#2D6A4F]">+{profitRatio}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* KOLOM KANAN (5/12): Tagihan, Diskon, Pembayaran Kasir */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="bg-white p-4 rounded-3xl border border-[#E8DEC8] shadow-md flex flex-col justify-between">
            {/* Header Keranjang Kasir */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D8F3DC] text-[#1B4332] flex items-center justify-center font-black">
                  <ShoppingCart className="w-4 h-4 text-[#2D6A4F]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Tagihan Kasir</h3>
                  <div className="text-[10px] text-gray-500">{cart.length} Jenis Produk</div>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Kosongkan</span>
                </button>
              )}
            </div>

            {/* Customer Details input */}
            <div className="py-2.5 space-y-2 border-b border-[#FAF8F5]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] font-bold text-gray-600">Nama Petani / Pembeli</label>
                    {matchingCustomer && (
                      <span className="text-[9px] text-[#2D6A4F] font-bold">
                        {matchingCustomer.totalOrders}x Belanja
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Pelanggan Umum"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F]"
                  />
                </div>
              </div>

              {/* Quick Customer Picker from Directory */}
              {customers.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                  <span className="text-gray-400 shrink-0">Pilih Cepat:</span>
                  {customers.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCustomerName(c.name);
                        setCustomerPhone(c.phone);
                      }}
                      className="px-2 py-0.5 bg-gray-100 hover:bg-[#D8F3DC] hover:text-[#1B4332] rounded-lg shrink-0 border border-gray-200 cursor-pointer font-medium"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* List of Cart Items */}
            <div className="my-2 max-h-52 overflow-y-auto space-y-2 pr-1">
              {cart.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-xs">
                  <Receipt className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <span>Keranjang kasir masih kosong.</span>
                  <p className="text-[10px] text-gray-400 mt-1">Pilih produk dari katalog atau scan barcode.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E8DEC8] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 truncate">{item.product.name}</div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-2">
                        <span>{formatRupiah(item.product.price)} / {item.product.unit}</span>
                        <span className="text-[#2D6A4F] font-bold font-mono">
                          Laba: +{formatRupiah(item.product.price - getProductBuyPrice(item.product))}
                        </span>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateQty(item.product.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-[#D5C7B0] flex items-center justify-center font-bold hover:bg-[#EAE0D0] cursor-pointer"
                      >
                        <Minus className="w-3 h-3 text-[#1B4332]" />
                      </button>
                      <span className="w-6 text-center font-black text-xs text-[#1B4332]">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(item.product.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-[#D5C7B0] flex items-center justify-center font-bold hover:bg-[#EAE0D0] cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-[#1B4332]" />
                      </button>
                    </div>

                    <div className="text-right shrink-0 min-w-16">
                      <div className="font-extrabold text-[#1B4332]">
                        {formatRupiah(item.product.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="text-[10px] text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Auto Discount Progress Indicator */}
            {rawSubtotal > 0 && (
              <div className="p-2.5 bg-[#FEF3C7]/60 border border-[#FDE68A] rounded-xl text-xs space-y-1 mb-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#78350F] flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-[#D97706]" />
                    Promo Toko: Diskon 10% Min Rp 1 Juta
                  </span>
                  {rawSubtotal >= AUTO_DISCOUNT_THRESHOLD ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#2D6A4F] text-[#D8F3DC] text-[10px] font-black">
                      AKTIF -10%
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#92400E]">
                      Kurang {formatRupiah(AUTO_DISCOUNT_THRESHOLD - rawSubtotal)}
                    </span>
                  )}
                </div>
                <div className="w-full bg-[#E8DEC8] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D97706] h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (rawSubtotal / AUTO_DISCOUNT_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Calculations Summary with Tiered Breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-[#E8DEC8] text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal Produk:</span>
                <span className="font-bold text-gray-900">{formatRupiah(rawSubtotal)}</span>
              </div>

              {/* Potongan Sistem 10% */}
              {discountInfo.systemDiscountAmount > 0 && (
                <div className="flex justify-between text-[#1B4332] font-bold bg-[#D8F3DC] px-2 py-0.5 rounded-md">
                  <span>Diskon Sistem 10% (≥ 1 Jt):</span>
                  <span>-{formatRupiah(discountInfo.systemDiscountAmount)}</span>
                </div>
              )}

              {/* Potongan Manual jika ada */}
              {additionalDiscount > 0 && (
                <div className="flex justify-between text-[#8B5E3C] font-bold bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#D5C7B0]">
                  <span>Diskon Tambahan Kasir:</span>
                  <span>-{formatRupiah(additionalDiscount)}</span>
                </div>
              )}

              {/* Total Tagihan */}
              <div className="flex justify-between items-center text-sm font-black text-gray-900 pt-1.5 border-t border-[#FAF8F5]">
                <span>TOTAL BAYAR:</span>
                <span className="text-lg text-[#1B4332] font-black">{formatRupiah(finalTotal)}</span>
              </div>

              {/* Profit Indicator for Cashier/Store Owner */}
              {rawSubtotal > 0 && (
                <div className="flex justify-between items-center text-[11px] text-[#2D6A4F] bg-[#D8F3DC]/40 px-2.5 py-1 rounded-lg border border-[#74C69D]/30 font-semibold">
                  <span>Estimasi Laba Kotor Transaksi:</span>
                  <span className="font-extrabold">+{formatRupiah(totalProfit)}</span>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="mt-3 pt-3 border-t border-[#E8DEC8] space-y-2">
              <label className="block text-[11px] font-bold text-gray-700">Metode Pembayaran Kasir:</label>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-gray-700 border border-[#D5C7B0]'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Tunai (Cash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'qris'
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-gray-700 border border-[#D5C7B0]'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QRIS Kasir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer_bca')}
                  className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'transfer_bca'
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-gray-700 border border-[#D5C7B0]'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Transfer Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('piutang')}
                  className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'piutang'
                      ? 'bg-[#8B5E3C] text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-gray-700 border border-[#D5C7B0]'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Bon / Tempo</span>
                </button>
              </div>

              {/* Cash payment amount & change calculator */}
              {paymentMethod === 'cash' && (
                <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#D5C7B0] space-y-2 mt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Uang Tunai Diterima:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Masukkan nominal uang tunai..."
                        value={cashGiven}
                        onChange={(e) => setCashGiven(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm font-bold bg-white border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F]"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                        Rp
                      </span>
                    </div>
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setCashGiven(String(finalTotal))}
                      className="px-2 py-1 bg-white hover:bg-[#EAE0D0] border border-[#D5C7B0] rounded-lg font-bold cursor-pointer"
                    >
                      Uang Pas ({formatRupiah(finalTotal)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashGiven('50000')}
                      className="px-2 py-1 bg-white hover:bg-[#EAE0D0] border border-[#D5C7B0] rounded-lg font-bold cursor-pointer"
                    >
                      50.000
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashGiven('100000')}
                      className="px-2 py-1 bg-white hover:bg-[#EAE0D0] border border-[#D5C7B0] rounded-lg font-bold cursor-pointer"
                    >
                      100.000
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashGiven('200000')}
                      className="px-2 py-1 bg-white hover:bg-[#EAE0D0] border border-[#D5C7B0] rounded-lg font-bold cursor-pointer"
                    >
                      200.000
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashGiven('500000')}
                      className="px-2 py-1 bg-white hover:bg-[#EAE0D0] border border-[#D5C7B0] rounded-lg font-bold cursor-pointer"
                    >
                      500.000
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashGiven('1000000')}
                      className="px-2 py-1 bg-white hover:bg-[#EAE0D0] border border-[#D5C7B0] rounded-lg font-bold cursor-pointer"
                    >
                      1.000.000
                    </button>
                  </div>

                  {/* Kembalian calculation banner */}
                  <div className="pt-1.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700">Uang Kembalian:</span>
                    <span
                      className={`text-sm font-black ${
                        isCashInsufficient ? 'text-rose-600' : 'text-[#2D6A4F]'
                      }`}
                    >
                      {isCashInsufficient
                        ? `Kurang ${formatRupiah(finalTotal - numericCash)}`
                        : formatRupiah(cashChange)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Process CTA Button */}
            <button
              onClick={handleProcessTransaction}
              disabled={isProcessing || cart.length === 0 || isCashInsufficient}
              className="mt-4 w-full py-3.5 bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#081C15] disabled:opacity-50 text-white rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[#2D6A4F]/25 cursor-pointer border border-[#52B788]/40 transition-all"
            >
              <CheckCircle2 className="w-5 h-5 text-[#74C69D]" />
              <span>
                {isProcessing
                  ? 'Menyimpan Transaksi & Potong Stok...'
                  : `Proses Transaksi & Cetak Struk (${formatRupiah(finalTotal)})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Cetak Struk Kasir */}
      <PosReceiptModal
        order={recentCompletedOrder}
        onClose={() => setIsReceiptOpen(false)}
        onNewTransaction={() => {
          setIsReceiptOpen(false);
          setRecentCompletedOrder(null);
        }}
      />
    </div>
  );
};
