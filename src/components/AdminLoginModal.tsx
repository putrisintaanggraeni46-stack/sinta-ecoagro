import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (adminEmail: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('putrisintaanggraeni46@gmail.com');
  const [pin, setPin] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Admin authentication
    if (
      (email.trim() === 'putrisintaanggraeni46@gmail.com' || email.trim() === 'admin@tokopertanian.id' || email.trim() === 'admin') &&
      (pin === 'admin123' || pin === 'tani123' || pin === '123456')
    ) {
      onSuccess(email);
      onClose();
    } else {
      setErrorMsg('Email atau PIN admin tidak sesuai. Gunakan email pemilik toko atau klik tombol Login Cepat.');
    }
  };

  const handleQuickDemoLogin = () => {
    onSuccess('putrisintaanggraeni46@gmail.com');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-3 border border-amber-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black">Login Admin Toko Pertanian</h2>
          <p className="text-xs text-emerald-200 mt-0.5">
            Kelola stok produk, approval bukti transfer, pelanggan & laporan sales
          </p>
        </div>

        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Access Card */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="text-xs">
              <div className="font-bold text-emerald-950 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Akses Khusus Pemilik Toko:
              </div>
              <div className="text-gray-500 text-[11px] mt-0.5">
                putrisintaanggraeni46@gmail.com
              </div>
            </div>
            <button
              onClick={handleQuickDemoLogin}
              className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Login Cepat
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email / Akun Admin
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tokopertanian.id"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                PIN / Kata Sandi Admin
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Default PIN toko: <code className="text-gray-600 font-mono">admin123</code></div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk ke Admin Panel</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
