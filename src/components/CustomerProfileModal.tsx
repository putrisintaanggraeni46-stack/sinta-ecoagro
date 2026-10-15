import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Check, 
  LogOut, 
  PackageCheck, 
  ShieldCheck,
  Save
} from 'lucide-react';
import { UserAccount } from '../types';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onUpdateProfile: (updated: UserAccount) => void;
  onOpenMyOrders: () => void;
  onLogout: () => void;
  ordersCount?: number;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
  onOpenMyOrders,
  onLogout,
  ordersCount = 0,
}) => {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !user) return null;

  const totalOrders = Math.max(ordersCount, user.totalOrders || 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserAccount = {
      ...user,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };

    onUpdateProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E8DEC8] my-8 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] text-[#1B4332] flex items-center justify-center font-bold">
              <User className="w-5 h-5 text-[#2D6A4F]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Profil Akun Pelanggan</h3>
              <p className="text-[11px] text-[#D8F3DC]">{user.email || 'Akun Resmi EcoAgro'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onClose(); onOpenMyOrders(); }}
              className="p-2.5 bg-[#D8F3DC]/70 hover:bg-[#B7E4C7] border border-[#74C69D] text-[#1B4332] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <PackageCheck className="w-4 h-4 text-[#2D6A4F]" />
              <span>Riwayat ({totalOrders} Pesanan)</span>
            </button>

            <button
              onClick={() => { onLogout(); onClose(); }}
              className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Akun</span>
            </button>
          </div>

          {/* EDIT FORM */}
          <form onSubmit={handleSave} className="p-4 bg-[#FAF8F5] rounded-3xl border border-[#E8DEC8] space-y-3.5">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#2D6A4F]" />
              <span>Informasi Kontak & Pengiriman</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap petani/pembeli"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F]"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F]"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Alamat Lengkap Lahan / Pengiriman
              </label>
              <div className="relative">
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Dusun/Jalan, RT/RW, Desa, Kecamatan, Kab/Kota, Kode Pos"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F]"
                />
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                Alamat otomatis terisi saat Anda checkout belanja
              </span>

              <button
                type="submit"
                className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Guarantee info */}
          <div className="p-3 bg-white rounded-2xl border border-[#E8DEC8] flex items-center gap-2.5 text-xs text-gray-600">
            <ShieldCheck className="w-5 h-5 text-[#2D6A4F] shrink-0" />
            <p className="text-[11px]">
              Data alamat Anda terlindungi dan hanya digunakan untuk keperluan pengiriman produk pertanian EcoAgro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
