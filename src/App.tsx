import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Search, 
  Filter, 
  ShoppingCart, 
  CheckCircle, 
  Sparkles, 
  Database, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Package,
  Lock,
  Award,
  Leaf,
  User,
  UserCheck,
  Crown
} from 'lucide-react';
import { 
  Product, 
  Order, 
  Customer, 
  CartItem, 
  ProductCategory, 
  OrderStatus, 
  StockMutation, 
  UserAccount 
} from './types';
import { 
  seedInitialProducts, 
  subscribeToProducts, 
  subscribeToOrders, 
  subscribeToCustomers,
  subscribeToStockMutations,
  saveProduct,
  updateProductStock,
  deleteProduct,
  createOrder,
  submitPaymentProof,
  approvePaymentProof,
  rejectPaymentProof,
  updateOrderStatus,
  addSupplierStock,
  adjustStockWithMutation,
  batchUpdatePricing
} from './services/storeService';
import { testConnection } from './firebase';
import { EcoAgroLogo } from './components/EcoAgroLogo';
import { Navbar } from './components/Navbar';
import { Banner } from './components/Banner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { CustomerOrdersModal } from './components/CustomerOrdersModal';
import { WhatsAppHelpButton } from './components/WhatsAppHelpButton';
import { formatRupiah } from './utils/formatters';

const CART_STORAGE_KEY = 'ecoagro_cart_v2';
const ADMIN_STORAGE_KEY = 'ecoagro_admin_email_v2';
const CUSTOMER_STORAGE_KEY = 'ecoagro_customer_account_v2';

export default function App() {
  // Real Firestore Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [mutations, setMutations] = useState<StockMutation[]>([]);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cart & UI Navigation
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Views
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [recentCreatedOrder, setRecentCreatedOrder] = useState<Order | null>(null);

  // Customer Authentication & Profile Modals
  const [loggedInCustomer, setLoggedInCustomer] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [isCustomerProfileOpen, setIsCustomerProfileOpen] = useState(false);
  const [isCustomerOrdersOpen, setIsCustomerOrdersOpen] = useState(false);

  // Admin View State
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    return localStorage.getItem(ADMIN_STORAGE_KEY) || null;
  });
  const [isAdminView, setIsAdminView] = useState(false);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  // Save admin login to local storage
  useEffect(() => {
    if (adminEmail) {
      localStorage.setItem(ADMIN_STORAGE_KEY, adminEmail);
    } else {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }, [adminEmail]);

  // Save customer login to local storage
  useEffect(() => {
    if (loggedInCustomer) {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(loggedInCustomer));
    } else {
      localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    }
  }, [loggedInCustomer]);

  // Keyboard shortcut listener to open hidden admin login (Alt+A or Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Intercept special search terms like "/admin" or "adminlogin" for discreet admin access
  const handleSearchChange = (val: string) => {
    if (val.trim().toLowerCase() === '/admin' || val.trim().toLowerCase() === 'adminlogin') {
      setSearchQuery('');
      setIsAdminLoginOpen(true);
    } else {
      setSearchQuery(val);
    }
  };

  // Connect to Firestore & Subscribe
  useEffect(() => {
    let unsubProducts: (() => void) | undefined;
    let unsubOrders: (() => void) | undefined;
    let unsubCustomers: (() => void) | undefined;
    let unsubMutations: (() => void) | undefined;

    async function initApp() {
      try {
        await testConnection();
        setIsDbConnected(true);

        // Seed 50 products if empty or fewer than 40
        await seedInitialProducts(false);

        // Subscriptions
        unsubProducts = subscribeToProducts(
          (prods) => {
            setProducts(prods);
            setIsLoading(false);
          },
          (err) => console.error('Products listener error:', err)
        );

        unsubOrders = subscribeToOrders(
          (ords) => setOrders(ords),
          (err) => console.error('Orders listener error:', err)
        );

        unsubCustomers = subscribeToCustomers(
          (custs) => setCustomers(custs),
          (err) => console.error('Customers listener error:', err)
        );

        unsubMutations = subscribeToStockMutations(
          (muts) => setMutations(muts),
          (err) => console.error('Mutations listener error:', err)
        );
      } catch (err) {
        console.error('Initialization error:', err);
        setIsLoading(false);
      }
    }

    initApp();

    return () => {
      if (unsubProducts) unsubProducts();
      if (unsubOrders) unsubOrders();
      if (unsubCustomers) unsubCustomers();
      if (unsubMutations) unsubMutations();
    };
  }, []);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleAddToCartWithQty = (product: Product, quantity: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock;
          return { ...item, quantity: Math.min(maxStock, quantity) };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Order operations
  const handleSubmitOrder = async (orderPayload: Omit<Order, 'id'>): Promise<string> => {
    const newOrderId = await createOrder(orderPayload);
    const finalId = newOrderId || `ord-${Date.now()}`;
    const createdOrder: Order = {
      ...orderPayload,
      id: finalId,
    };
    setRecentCreatedOrder(createdOrder);

    // Update logged-in customer info and record order
    setLoggedInCustomer((prev) => {
      const cleanPhone = (orderPayload.customerPhone || '').replace(/[^0-9]/g, '');
      const updatedCustomer: UserAccount = {
        id: prev?.id || orderPayload.customerId || `cust-${cleanPhone || Date.now()}`,
        email: prev?.email || orderPayload.customerEmail || 'pelanggan@ecoagro.id',
        name: orderPayload.customerName || prev?.name || 'Pelanggan EcoAgro',
        phone: orderPayload.customerPhone || prev?.phone || '',
        address: orderPayload.customerAddress || prev?.address || '',
        role: 'customer',
        totalOrders: (prev?.totalOrders || 0) + 1,
        createdAt: prev?.createdAt || new Date().toISOString(),
      };
      try {
        localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(updatedCustomer));
      } catch {
        // ignore
      }
      return updatedCustomer;
    });

    if (orderPayload.orderSource !== 'pos') {
      handleClearCart();
      setIsCheckoutOpen(false);
    }
    return finalId;
  };

  const handleSubmitProof = async (orderId: string, proofUrl: string) => {
    await submitPaymentProof(orderId, proofUrl);
    // Update local recent order if matching
    if (recentCreatedOrder && recentCreatedOrder.id === orderId) {
      setRecentCreatedOrder({
        ...recentCreatedOrder,
        status: 'proof_submitted',
        paymentProofUrl: proofUrl,
      });
    }
  };

  // Admin operations
  const handleAdminLoginSuccess = (email: string) => {
    setAdminEmail(email);
    setIsAdminView(true);
  };

  const handleAdminLogout = () => {
    setAdminEmail(null);
    setIsAdminView(false);
  };

  const handleSaveProduct = async (productData: Partial<Product> & { id?: string }) => {
    return await saveProduct(productData);
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    await updateProductStock(productId, newStock);
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId);
  };

  const handleResetDefaultProducts = async () => {
    await seedInitialProducts(true);
  };

  const handleApprovePayment = async (orderId: string, notes?: string) => {
    await approvePaymentProof(orderId, notes);
  };

  const handleRejectPayment = async (orderId: string, reason: string) => {
    await rejectPaymentProof(orderId, reason);
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus, trackingNumber?: string) => {
    await updateOrderStatus(orderId, status, trackingNumber);
  };

  const handleAddSupplierStock = async (productId: string, productName: string, qty: number, supplier: string, notes?: string) => {
    await addSupplierStock(productId, productName, qty, supplier, notes);
  };

  const handleAdjustStock = async (productId: string, productName: string, targetStock: number, reason: string) => {
    await adjustStockWithMutation(productId, productName, targetStock, reason);
  };

  const handleBatchUpdatePricing = async (
    updates: { id: string; price: number; buyPrice?: number; profitRatio?: number }[]
  ) => {
    await batchUpdatePricing(updates);
  };

  // Customer Account handlers - Direct 1-Click access without requiring credentials
  const handleDirectCustomerLogin = () => {
    // If there is previously saved customer profile in localStorage, load it
    const savedCustomerStr = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (savedCustomerStr) {
      try {
        const parsed = JSON.parse(savedCustomerStr);
        if (parsed && parsed.name) {
          const userObj: UserAccount = {
            id: parsed.id || `cust-${Date.now()}`,
            email: parsed.email || 'pelanggan@ecoagro.id',
            name: parsed.name,
            phone: parsed.phone || '085600556628',
            address: parsed.address || 'Jl. Pertanian Makmur Indonesia',
            role: 'customer',
            totalOrders: parsed.totalOrders || 0,
            createdAt: parsed.createdAt || new Date().toISOString(),
          };
          setLoggedInCustomer(userObj);
          setIsCustomerAuthOpen(false);
          return;
        }
      } catch (e) {
        console.warn('Error reading saved customer', e);
      }
    }

    // Otherwise create standard customer session immediately
    const instantCustomer: UserAccount = {
      id: `cust-${Date.now()}`,
      email: 'pelanggan@ecoagro.id',
      name: 'Pelanggan EcoAgro',
      phone: '085600556628',
      address: 'Jl. Pertanian Makmur Indonesia',
      role: 'customer',
      totalOrders: 0,
      createdAt: new Date().toISOString(),
    };
    setLoggedInCustomer(instantCustomer);
    setIsCustomerAuthOpen(false);
  };

  const handleCustomerLoginSuccess = (user: UserAccount) => {
    setLoggedInCustomer(user);
    setIsCustomerAuthOpen(false);
  };

  const handleCustomerLogout = () => {
    setLoggedInCustomer(null);
    setIsCustomerProfileOpen(false);
    setIsCustomerOrdersOpen(false);
  };

  const handleUpdateCustomerProfile = (updated: UserAccount) => {
    setLoggedInCustomer(updated);
  };

  // Product Filter
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const cartTotalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // If Admin View is active, render the Admin Dashboard
  if (isAdminView && adminEmail) {
    return (
      <AdminDashboard
        adminEmail={adminEmail}
        onLogout={handleAdminLogout}
        onBackToStore={() => setIsAdminView(false)}
        products={products}
        orders={orders}
        customers={customers}
        mutations={mutations}
        onSaveProduct={handleSaveProduct}
        onUpdateStock={handleUpdateStock}
        onDeleteProduct={handleDeleteProduct}
        onResetDefaultProducts={handleResetDefaultProducts}
        onApprovePayment={handleApprovePayment}
        onRejectPayment={handleRejectPayment}
        onUpdateStatus={handleUpdateStatus}
        onAddSupplierStock={handleAddSupplierStock}
        onAdjustStock={handleAdjustStock}
        onCreateOrder={handleSubmitOrder}
        onBatchUpdatePricing={handleBatchUpdatePricing}
        isDbConnected={isDbConnected}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2A26] flex flex-col font-sans">
      {/* Navigation Bar */}
      <Navbar
        cartItemCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        isAdminLoggedIn={Boolean(adminEmail)}
        onOpenAdminPanel={() => setIsAdminView(true)}
        onAdminLogout={handleAdminLogout}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        loggedInCustomer={loggedInCustomer}
        onEnterAsCustomer={handleDirectCustomerLogin}
        onOpenCustomerProfile={() => setIsCustomerProfileOpen(true)}
        onOpenCustomerOrders={() => setIsCustomerOrdersOpen(true)}
        onCustomerLogout={handleCustomerLogout}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isDbConnected={isDbConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Promotional Hero Banner */}
        <Banner />

        {/* Product Catalog Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">
                <Leaf className="w-4 h-4 text-[#2D6A4F]" />
                <span>Katalog Lengkap Perlengkapan Tani Nusantara</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#1B4332] mt-1">
                {selectedCategory === 'Semua' ? '50 Produk Pertanian EcoAgro' : selectedCategory}
              </h2>
              <p className="text-xs text-[#78350F]/70 mt-0.5">
                Menampilkan {filteredProducts.length} produk siap kirim ke seluruh pelosok lahan pertanian
              </p>
            </div>

            {/* Promo Highlight Badge */}
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] font-bold border border-[#FDE68A] text-[11px] flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                Belanja min. Rp 1 Jt: Diskon Otomatis 10%
              </span>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-4 border border-[#E8DEC8] shadow-2xs animate-pulse space-y-3">
                  <div className="aspect-4/3 bg-[#F4EFE6] rounded-2xl" />
                  <div className="h-4 bg-[#F4EFE6] rounded w-3/4" />
                  <div className="h-3 bg-[#F4EFE6] rounded w-1/2" />
                  <div className="h-8 bg-[#F4EFE6] rounded mt-4" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E8DEC8] p-12 text-center max-w-md mx-auto my-8 shadow-xs">
              <Package className="w-12 h-12 text-[#8B5E3C]/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#1B4332]">Tidak Menemukan Produk</h3>
              <p className="text-xs text-[#78350F]/70 mt-1">
                Coba gunakan kata kunci lain atau pilih kategori "Semua" pada menu atas.
              </p>
              <button
                onClick={() => { setSelectedCategory('Semua'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={handleAddToCart}
                  onViewDetail={(p) => setDetailProduct(p)}
                  isInCart={cartItems.some((ci) => ci.product.id === prod.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Cart Button */}
      {cartTotalCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#081C15] text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-[#1B4332]/30 transition-all hover:scale-105 cursor-pointer font-bold text-sm border border-[#52B788]/40"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-[#D8F3DC]" />
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#F59E0B] text-[#78350F] text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                {cartTotalCount}
              </span>
            </div>
            <span>Keranjang Belanja</span>
            <span className="bg-[#1B4332] px-2 py-0.5 rounded-lg text-xs font-black text-[#FEF3C7]">
              {formatRupiah(cartItems.reduce((sum, it) => sum + it.product.price * it.quantity, 0))}
            </span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#1B4332] text-white mt-auto border-t border-[#2D6A4F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
            {/* Store Bio */}
            <div className="space-y-3">
              <EcoAgroLogo
                onClick={Boolean(adminEmail) ? () => setIsAdminView(true) : () => setIsAdminLoginOpen(true)}
                size="md"
                dark
                title="EcoAgro - Toko Pertanian"
              />
              <p className="text-[#D8F3DC]/80 leading-relaxed text-[11px]">
                Marketplace penyedia 50+ sarana produksi pertanian ramah lingkungan & modern: Benih unggul, pupuk organik, proteksi hama nabati & kimia, alat mesin, irigasi hingga pakan ternak.
              </p>
              <div className="flex items-center gap-1.5 text-[#D8F3DC] font-medium text-[11px]">
                <ShieldCheck className="w-4 h-4 text-[#74C69D]" />
                <span>Jaminan 100% Produk Tani Asli & Bergaransi Mutu</span>
              </div>
            </div>

            {/* Categories Links */}
            <div>
              <h4 className="font-bold text-sm text-[#FEF3C7] mb-3 uppercase tracking-wider">
                Kategori Produk
              </h4>
              <ul className="space-y-2 text-[#D8F3DC]/80">
                <li>
                  <button onClick={() => setSelectedCategory('Benih & Bibit Unggul')} className="hover:text-white transition-colors cursor-pointer text-left">
                    • Benih & Bibit Unggul
                  </button>
                </li>
                <li>
                  <button onClick={() => setSelectedCategory('Pupuk, Nutrisi & Hayati')} className="hover:text-white transition-colors cursor-pointer text-left">
                    • Pupuk, Nutrisi & Hayati
                  </button>
                </li>
                <li>
                  <button onClick={() => setSelectedCategory('Pestisida & Proteksi Tanaman')} className="hover:text-white transition-colors cursor-pointer text-left">
                    • Pestisida & Proteksi Tanaman
                  </button>
                </li>
                <li>
                  <button onClick={() => setSelectedCategory('Alat, Mesin & Perlengkapan Tani')} className="hover:text-white transition-colors cursor-pointer text-left">
                    • Alat & Mesin Tani
                  </button>
                </li>
              </ul>
            </div>

            {/* Operational Info */}
            <div>
              <h4 className="font-bold text-sm text-[#FEF3C7] mb-3 uppercase tracking-wider">
                Layanan & Pengiriman
              </h4>
              <div className="space-y-2.5 text-[#D8F3DC]/80 text-[11px]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#74C69D] shrink-0" />
                  <span>Buka Setiap Hari: 07.00 - 17.00 WIB</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#74C69D] shrink-0" />
                  <span>Konsultasi Pertanian: 0812-3456-7890</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#74C69D] shrink-0" />
                  <span>Gudang Distribusi Agro Nasional Indonesia</span>
                </div>
                <div className="pt-1.5">
                  <a
                    href="https://wa.me/6285600556628?text=Halo%20EcoAgro,%20ada%20kendala%20yang%20ingin%20saya%20tanyakan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20BA5C] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Jika ada kendala silahkan hubungi</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Quality & Assurance Column */}
            <div>
              <h4 className="font-bold text-sm text-[#FEF3C7] mb-3 uppercase tracking-wider">
                Jaminan Mutu EcoAgro
              </h4>
              <div className="space-y-2 text-[#D8F3DC]/80 text-[11px] leading-relaxed">
                <p>
                  Diskon 10% otomatis untuk belanja minimal Rp 1.000.000. Seluruh produk original tersegel pabrikan resmi.
                </p>
                <div className="p-3 rounded-xl bg-[#2D6A4F]/60 border border-[#40916C]/40 text-[#FEF3C7] mt-2">
                  <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
                    <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
                    Garansi 100% Produk Asli
                  </div>
                  <div>Kemasan tersegel pabrikan resmi & siap kirim ke seluruh nusantara.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="mt-8 pt-6 border-t border-[#2D6A4F] flex flex-col sm:flex-row items-center justify-between text-xs text-[#95D5B2] gap-2">
            <div>
              © 2026 EcoAgro Store Indonesia. Seluruh hak cipta dilindungi. Terhubung ke Real Database Firestore.
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#52B788]/60">Mitra Petani Nusantara</span>
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="opacity-40 hover:opacity-100 transition-opacity p-1 text-[#D8F3DC] hover:text-[#FEF3C7] rounded cursor-pointer"
                title="Akses Admin Eco"
                aria-label="Portal Admin Eco"
              >
                <Lock className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Detail Product Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCartWithQty={handleAddToCartWithQty}
      />

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        loggedInCustomer={loggedInCustomer}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 3. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        loggedInCustomer={loggedInCustomer}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* 4. Order Success Modal */}
      <OrderSuccessModal
        order={recentCreatedOrder}
        onClose={() => setRecentCreatedOrder(null)}
        onSubmitProof={handleSubmitProof}
      />

      {/* 5. Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        orders={orders}
        onSubmitProof={handleSubmitProof}
      />

      {/* 6. Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* 7. Customer Auth Modal */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        onLoginSuccess={handleCustomerLoginSuccess}
      />

      {/* 8. Customer Profile Modal with Real Order Count */}
      <CustomerProfileModal
        isOpen={isCustomerProfileOpen}
        onClose={() => setIsCustomerProfileOpen(false)}
        user={loggedInCustomer}
        ordersCount={
          orders.filter((o) => {
            if (!loggedInCustomer) return false;
            const cleanCustPhone = (loggedInCustomer.phone || '').replace(/[^0-9]/g, '');
            const cleanOrderPhone = (o.customerPhone || '').replace(/[^0-9]/g, '');
            return (
              (cleanCustPhone.length >= 8 && cleanCustPhone === cleanOrderPhone) ||
              (loggedInCustomer.id && o.customerId === loggedInCustomer.id)
            );
          }).length
        }
        onUpdateProfile={handleUpdateCustomerProfile}
        onOpenMyOrders={() => {
          setIsCustomerProfileOpen(false);
          setIsCustomerOrdersOpen(true);
        }}
        onLogout={handleCustomerLogout}
      />

      {/* 9. Customer Orders Modal */}
      <CustomerOrdersModal
        isOpen={isCustomerOrdersOpen}
        onClose={() => setIsCustomerOrdersOpen(false)}
        user={loggedInCustomer}
        orders={orders}
        onSubmitProof={handleSubmitProof}
      />

      {/* 10. Persistent Floating WhatsApp Assistance Widget */}
      <WhatsAppHelpButton 
        variant="floating" 
        customText="Jika ada kendala silahkan hubungi" 
      />
    </div>
  );
}
