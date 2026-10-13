import React, { useState } from 'react';
import { 
  LayoutDashboard,
  Package, 
  ClipboardCheck, 
  Warehouse,
  Users, 
  BarChart3, 
  ArrowLeft, 
  LogOut, 
  ShieldCheck, 
  Sprout, 
  Database 
} from 'lucide-react';
import { Product, Order, Customer, OrderStatus, StockMutation } from '../../types';
import { AdminOverviewTab } from './AdminOverviewTab';
import { ProductManagementTab } from './ProductManagementTab';
import { OrderApprovalTab } from './OrderApprovalTab';
import { InventoryManagementTab } from './InventoryManagementTab';
import { CustomerManagementTab } from './CustomerManagementTab';
import { SalesReportsTab } from './SalesReportsTab';

interface AdminDashboardProps {
  adminEmail: string;
  onLogout: () => void;
  onBackToStore: () => void;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  mutations: StockMutation[];
  onSaveProduct: (product: Partial<Product> & { id?: string }) => Promise<string>;
  onUpdateStock: (productId: string, newStock: number) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onResetDefaultProducts: () => Promise<void>;
  onApprovePayment: (orderId: string, notes?: string) => Promise<void>;
  onRejectPayment: (orderId: string, reason: string) => Promise<void>;
  onUpdateStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => Promise<void>;
  onAddSupplierStock: (productId: string, productName: string, qty: number, supplier: string, notes?: string) => Promise<void>;
  onAdjustStock: (productId: string, productName: string, targetStock: number, reason: string) => Promise<void>;
  isDbConnected: boolean;
}

export type AdminTab = 'overview' | 'orders' | 'products' | 'inventory' | 'customers' | 'reports';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminEmail,
  onLogout,
  onBackToStore,
  products,
  orders,
  customers,
  mutations,
  onSaveProduct,
  onUpdateStock,
  onDeleteProduct,
  onResetDefaultProducts,
  onApprovePayment,
  onRejectPayment,
  onUpdateStatus,
  onAddSupplierStock,
  onAdjustStock,
  isDbConnected,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const pendingApprovalsCount = orders.filter((o) => o.status === 'proof_submitted').length;
  const criticalStockCount = products.filter((p) => p.stock <= (p.minStockAlert || 10)).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2A26] pb-16 font-sans">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-[#1B4332] text-white shadow-md border-b border-[#2D6A4F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Back & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToStore}
                className="p-2 rounded-xl bg-[#2D6A4F] hover:bg-[#40916C] text-[#D8F3DC] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Kembali ke Webstore EcoAgro"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Ke Webstore</span>
              </button>

              <div className="h-6 w-px bg-[#2D6A4F]" />

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#1B4332] flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-extrabold text-sm sm:text-base leading-tight">
                      Admin Panel EcoAgro
                    </h1>
                    <span className="px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] font-black text-[10px]">
                      ROLE: ADMIN ECO
                    </span>
                  </div>
                  <p className="text-[11px] text-[#D8F3DC]">
                    Pusat Kendali Operasional, Stok Gudang & Approval Pembayaran
                  </p>
                </div>
              </div>
            </div>

            {/* Right: DB Status & Admin Info */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 bg-[#2D6A4F]/80 px-2.5 py-1 rounded-lg text-[11px] text-[#D8F3DC] border border-[#52B788]/30">
                <Database className="w-3.5 h-3.5 text-[#52B788]" />
                <span>{isDbConnected ? 'Firestore Live' : 'Connecting...'}</span>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white truncate max-w-44">
                  {adminEmail}
                </div>
                <div className="text-[10px] text-[#FDE68A] font-semibold uppercase tracking-wider">
                  Admin Eco (Full Control)
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-xl transition-colors cursor-pointer"
                title="Keluar dari Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#2D6A4F] overflow-x-auto pb-0.5 scrollbar-none">
            {[
              {
                id: 'overview',
                label: 'Dashboard Utama',
                icon: LayoutDashboard,
                badge: null,
              },
              {
                id: 'orders',
                label: 'Approval & Pesanan',
                icon: ClipboardCheck,
                badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
              },
              {
                id: 'products',
                label: `Katalog Produk (${products.length})`,
                icon: Package,
                badge: null,
              },
              {
                id: 'inventory',
                label: 'Gudang & Stok',
                icon: Warehouse,
                badge: criticalStockCount > 0 ? `${criticalStockCount} Kritis` : null,
              },
              {
                id: 'customers',
                label: `Data Pelanggan (${customers.length})`,
                icon: Users,
                badge: null,
              },
              {
                id: 'reports',
                label: 'Laporan Sales & Omzet',
                icon: BarChart3,
                badge: null,
              },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2D6A4F] text-white shadow-xs border border-[#52B788]/40'
                      : 'text-[#D8F3DC] hover:text-white hover:bg-[#2D6A4F]/60'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== null && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#F59E0B] text-[#78350F] text-[10px] font-black animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'overview' && (
          <AdminOverviewTab
            orders={orders}
            products={products}
            customers={customers}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'orders' && (
          <OrderApprovalTab
            orders={orders}
            onApprovePayment={onApprovePayment}
            onRejectPayment={onRejectPayment}
            onUpdateStatus={onUpdateStatus}
          />
        )}

        {activeTab === 'products' && (
          <ProductManagementTab
            products={products}
            onSaveProduct={onSaveProduct}
            onUpdateStock={onUpdateStock}
            onDeleteProduct={onDeleteProduct}
            onResetDefaultProducts={onResetDefaultProducts}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManagementTab
            products={products}
            mutations={mutations}
            onAddSupplierStock={onAddSupplierStock}
            onAdjustStock={onAdjustStock}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerManagementTab customers={customers} />
        )}

        {activeTab === 'reports' && (
          <SalesReportsTab
            orders={orders}
            products={products}
            customers={customers}
          />
        )}
      </main>
    </div>
  );
};
