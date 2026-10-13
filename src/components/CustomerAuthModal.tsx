import React, { useState } from 'react';
import { X, User, CheckCircle2, AlertCircle, Loader2, Sparkles, LogIn, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { UserAccount } from '../types';
import { WhatsAppHelpButton } from './WhatsAppHelpButton';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  if (!isOpen) return null;

  // Direct instant entry: Zero input required!
  const handleInstantEnter = (nameOverride?: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const finalName = nameOverride || (customName.trim() ? customName.trim() : 'Pelanggan EcoAgro');
      const instantCustomer: UserAccount = {
        id: `cust-${Date.now()}`,
        email: 'pelanggan@ecoagro.id',
        name: finalName,
        phone: customPhone.trim() || '085600556628',
        address: customAddress.trim() || 'Jl. Pertanian Makmur Indonesia',
        role: 'customer',
        createdAt: new Date().toISOString(),
      };

      onLoginSuccess(instantCustomer);
      setIsSubmitting(false);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E8DEC8] my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#1B4332] via-[#24523B] to-[#5C3D2E] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 bg-[#FEF3C7] text-[#1B4332] rounded-2xl flex items-center justify-center mb-3 shadow-md border border-[#FDE68A]">
            <User className="w-6 h-6 text-[#2D6A4F]" />
          </div>
          <h2 className="text-xl font-extrabold">
            Masuk sebagai Pelanggan
          </h2>
          <p className="text-xs text-[#D8F3DC] mt-0.5">
            Tidak perlu login & tidak perlu isi kata sandi, langsung masuk ke web EcoAgro
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Main 1-Click Enter Button: NO INPUT NEEDED */}
          <div className="p-4 bg-[#D8F3DC]/60 border border-[#74C69D] rounded-2xl text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1B4332] text-[#FEF3C7] rounded-full text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#F59E0B]" />
              Akses Langsung Tanpa Login
            </div>
            <p className="text-xs text-[#1B4332] font-semibold leading-relaxed">
              Anda tidak perlu mendaftar atau mengingat kata sandi. Klik tombol di bawah ini untuk langsung aktif sebagai Pelanggan EcoAgro!
            </p>
            <button
              type="button"
              onClick={() => handleInstantEnter()}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#081C15] text-white rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[#2D6A4F]/25 hover:scale-[1.02] transition-all cursor-pointer border border-[#52B788]/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Membuka Akses Pelanggan...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#D8F3DC]" />
                  <span>Masuk sebagai Pelanggan (Langsung ke Web)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick preset choices */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Pilihan Cepat Profil Pelanggan:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInstantEnter('Petani Budi Santoso')}
                className="p-2.5 bg-[#FAF8F5] hover:bg-[#F4EFE6] border border-[#D5C7B0] rounded-xl text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-[#1B4332]">Pak Budi Santoso</div>
                <div className="text-[10px] text-[#78350F]/80">Petani Padi & Horti</div>
              </button>
              <button
                type="button"
                onClick={() => handleInstantEnter('Kelompok Tani Makmur')}
                className="p-2.5 bg-[#FAF8F5] hover:bg-[#F4EFE6] border border-[#D5C7B0] rounded-xl text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-[#1B4332]">Kelompok Tani</div>
                <div className="text-[10px] text-[#78350F]/80">Mitra Petani Desa</div>
              </button>
            </div>
          </div>

          {/* Optional custom identity toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="text-xs text-[#2D6A4F] hover:underline font-bold cursor-pointer"
            >
              {showOptionalFields ? '- Sembunyikan isian opsional' : '+ Mau ganti nama atau alamat Anda? (Opsional)'}
            </button>

            {showOptionalFields && (
              <div className="mt-3 space-y-2.5 p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8DEC8] animate-in fade-in duration-150">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Nama Anda / Kelompok Tani (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pak Herman"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D5C7B0] rounded-lg outline-none focus:border-[#2D6A4F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Nomor WhatsApp / HP (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D5C7B0] rounded-lg outline-none focus:border-[#2D6A4F]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleInstantEnter()}
                  className="w-full py-2 bg-[#8B5E3C] hover:bg-[#78350F] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Simpan & Masuk ke Web
                </button>
              </div>
            )}
          </div>

          {/* WhatsApp Support Section */}
          <div className="pt-2 border-t border-[#E8DEC8]">
            <div className="p-3 bg-[#FEF3C7]/60 border border-[#FDE68A] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="text-xs text-center sm:text-left">
                <div className="font-extrabold text-[#78350F] flex items-center justify-center sm:justify-start gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-[#D97706]" />
                  Ada kendala saat bertransaksi?
                </div>
                <div className="text-[11px] text-[#92400E]">
                  Tim EcoAgro siap melayani Anda lewat WhatsApp
                </div>
              </div>
              <WhatsAppHelpButton
                variant="inline"
                customText="Jika ada kendala silahkan hubungi"
                className="shrink-0 text-xs py-1.5 px-3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
