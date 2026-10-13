import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Sprout, 
  Search, 
  ShieldCheck, 
  PackageCheck, 
  LogOut, 
  User, 
  UserCheck,
  ChevronDown, 
  Lock 
} from 'lucide-react';
import { ProductCategory, UserAccount } from '../types';

interface NavbarProps {
  cartItemCount: number;
  onOpenCart: () => void;
  onOpenTracker: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminPanel: () => void;
  onAdminLogout: () => void;
  onOpenAdminLogin: () => void;
  loggedInCustomer: UserAccount | null;
  onEnterAsCustomer: () => void;
  onOpenCustomerProfile: () => void;
  onOpenCustomerOrders: () => void;
  onCustomerLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ProductCategory | 'Semua';
  setSelectedCategory: (cat: ProductCategory | 'Semua') => void;
  isDbConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartItemCount,
  onOpenCart,
  onOpenTracker,
  isAdminLoggedIn,
  onOpenAdminPanel,
  onAdminLogout,
  onOpenAdminLogin,
  loggedInCustomer,
  onEnterAsCustomer,
  onOpenCustomerProfile,
  onOpenCustomerOrders,
  onCustomerLogout,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  isDbConnected,
}) => {
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  const categories: (ProductCategory | 'Semua')[] = [
    'Semua',
    'Benih & Bibit Unggul',
    'Pupuk, Nutrisi & Hayati',
    'Pestisida & Proteksi Tanaman',
    'Alat, Mesin & Perlengkapan Tani',
    'Irigasi & Greenhouse',
    'Ternak, Wadah & Pasca Panen',
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8DEC8] shadow-xs">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] text-white flex items-center justify-center shadow-md shadow-[#2D6A4F]/25 border border-[#52B788]/40 shrink-0">
              <Sprout className="w-6 h-6 text-[#95D5B2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-[#1B4332] tracking-tight">
                  EcoAgro
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[10px] font-black rounded-full uppercase tracking-wider">
                  Store Pertanian
                </span>
              </div>
              <p className="text-[11px] text-[#78350F]/80 font-medium hidden sm:block">
                Benih Unggul, Pupuk & Mesin Tani Terlengkap
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari benih padi, pupuk NPK, traktor, atau obat hama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-[#D5C7B0] rounded-2xl outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 text-[#2D2A26] placeholder-[#A39988] transition-all shadow-inner"
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
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Role: Pelanggan (Tidak perlu login, langsung masuk) */}
            {loggedInCustomer ? (
              <div className="relative">
                <button
                  onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                  className="flex items-center gap-2 bg-[#D8F3DC] hover:bg-[#B7E4C7] text-[#1B4332] px-3 py-2 rounded-2xl text-xs font-bold border border-[#74C69D] transition-colors cursor-pointer"
                  title="Klik untuk lihat menu akun pelanggan"
                >
                  <div className="w-6 h-6 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center text-[10px] font-black">
                    {loggedInCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block max-w-28 truncate">
                    <div className="text-[10px] text-[#2D6A4F] uppercase font-black flex items-center gap-1">
                      <UserCheck className="w-2.5 h-2.5" /> Pelanggan Aktif
                    </div>
                    <div className="truncate text-xs font-bold">{loggedInCustomer.name}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#2D6A4F]" />
                </button>

                {isCustomerDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8DEC8] py-2 z-50 animate-in fade-in duration-150"
                    onMouseLeave={() => setIsCustomerDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#FAF8F5]">
                      <div className="text-xs font-black text-[#1B4332] truncate">{loggedInCustomer.name}</div>
                      <div className="text-[11px] text-[#78350F]/70 truncate">{loggedInCustomer.phone}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-[#D8F3DC] text-[#1B4332] font-extrabold text-[9px] rounded-md uppercase">
                        Role: Pelanggan EcoAgro
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsCustomerDropdownOpen(false);
                        onOpenCustomerOrders();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#2D2A26] hover:bg-[#FAF8F5] hover:text-[#1B4332] flex items-center gap-2 cursor-pointer"
                    >
                      <PackageCheck className="w-4 h-4 text-[#2D6A4F]" />
                      <span>Riwayat Pesanan Saya</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsCustomerDropdownOpen(false);
                        onOpenCustomerProfile();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#2D2A26] hover:bg-[#FAF8F5] hover:text-[#1B4332] flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[#8B5E3C]" />
                      <span>Profil & Alamat Kirim</span>
                    </button>

                    <div className="my-1 border-t border-[#FAF8F5]" />

                    <button
                      onClick={() => {
                        setIsCustomerDropdownOpen(false);
                        onCustomerLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Button Masuk sebagai Pelanggan (Langsung masuk, tanpa login & tanpa ketik apapun) */
              <button
                onClick={onEnterAsCustomer}
                className="flex items-center gap-1.5 bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#081C15] text-white px-3 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer border border-[#52B788]/30"
                title="Langsung masuk sebagai pelanggan tanpa perlu ketik email/password"
              >
                <User className="w-4 h-4 text-[#D8F3DC]" />
                <span className="hidden sm:inline">Masuk sebagai Pelanggan</span>
                <span className="sm:hidden">Pelanggan</span>
              </button>
            )}

            {/* Lacak Pesanan Button */}
            <button
              onClick={onOpenTracker}
              className="hidden sm:flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-[#EAE0D0] text-[#1B4332] border border-[#D5C7B0] px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              title="Lacak Pesanan & Status Pembayaran"
            >
              <PackageCheck className="w-4 h-4 text-[#2D6A4F]" />
              <span>Lacak Pesanan</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#081C15] text-white px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-[#2D6A4F]/20 transition-all hover:scale-[1.02] cursor-pointer border border-[#52B788]/30"
            >
              <ShoppingCart className="w-4 h-4 text-[#D8F3DC]" />
              <span className="hidden sm:inline">Keranjang</span>
              {cartItemCount > 0 && (
                <span className="min-w-5 h-5 px-1.5 bg-[#F59E0B] text-[#78350F] text-xs font-black rounded-full flex items-center justify-center shadow-xs animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Admin Eco Panel Trigger */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1 bg-[#FEF3C7] p-1 rounded-2xl border border-[#FDE68A]">
                <button
                  onClick={onOpenAdminPanel}
                  className="flex items-center gap-1.5 bg-[#D97706] hover:bg-[#B45309] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Panel Admin Eco</span>
                  <span className="sm:hidden">Admin</span>
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Logout Admin Eco"
                  className="p-1.5 text-[#92400E] hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-[#8B5E3C] hover:text-[#1B4332] bg-[#FAF8F5] hover:bg-[#EAE0D0] px-2.5 py-1.5 rounded-xl border border-[#D5C7B0]/60 transition-colors cursor-pointer"
                title="Masuk sebagai Admin Toko"
              >
                <Lock className="w-3 h-3 text-[#8B5E3C]" />
                <span>Admin Eco</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari benih, pupuk, alat mesin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F] text-[#2D2A26]"
            />
            <Search className="w-3.5 h-3.5 text-[#8B5E3C] absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'bg-[#F4EFE6] text-[#4A3E31] hover:bg-[#EAE0D0] hover:text-[#1B4332] border border-[#E8DEC8]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
