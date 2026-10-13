import React, { useState } from 'react';
import { X, User, Phone, MapPin, Mail, Check, LogOut, PackageCheck, ShieldCheck } from 'lucide-react';
import { UserAccount } from '../types';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onUpdateProfile: (updated: UserAccount) => void;
  onOpenMyOrders: () => void;
  onLogout: () => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
  onOpenMyOrders,
  onLogout,
}) => {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !user) return null;

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
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E8DEC8] my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] text-[#1B4332] flex items-center justify-center font-bold">
              <User className="w-5 h-5 text-[#2D6A4F]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Profil Pelanggan</h3>
              <p className="text-[11px] text-[#D8F3DC]">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onClose(); onOpenMyOrders(); }}
              className="p-3 bg-[#D8F3DC]/70 hover:bg-[#B7E4C7] border border-[#74C69D] text-[#1B4332] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <PackageCheck className="w-4 h-4 text-[#2D6A4F]" />
              <span>Lihat Pesanan Saya</span>
            </button>

            <button
              onClick={() => { onLogout(); onClose(); }}
              className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Akun</span>
            </button>
          </div>

          {/* Form Edit Profile */}
          <form onSubmit={handleSave} className="space-y-3 pt-2 border-t border-[#F0EAE1]">
            <div className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">
              Data Penerima & Alamat Default:
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4A3E31] mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4A3E31] mb-1">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4A3E31] mb-1">
                Alamat Lengkap Pengiriman Lahan / Rumah
              </label>
              <textarea
                rows={3}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D5C7B0] rounded-xl outline-none focus:border-[#2D6A4F]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{isSaved ? 'Tersimpan!' : 'Simpan Perubahan'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
