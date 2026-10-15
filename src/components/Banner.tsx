import React from 'react';
import { Award, Truck, HeartHandshake, Sparkles, CheckCircle2, Sprout, Sun, Percent, ArrowRight } from 'lucide-react';

export const Banner: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
      {/* Hero Card with Earthy Forest Green, Rich Soil Brown & Golden Wheat */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1B4332] via-[#24523B] to-[#5C3D2E] text-white p-6 sm:p-8 md:p-10 shadow-xl border border-[#74C69D]/20">
        {/* Subtle agrarian background sun rays & grain pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-2/3 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="90" cy="10" r="50" fill="#F59E0B" />
            <path d="M0,100 C30,70 70,80 100,50 L100,100 Z" fill="#FEF3C7" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#F59E0B]/20 border border-[#F59E0B]/40 px-3.5 py-1 rounded-full text-xs font-bold text-[#FDE68A] mb-3.5 shadow-2xs backdrop-blur-xs">
            <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
            EcoAgro • Ekosistem Pertanian Modern & Berkelanjutan
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Solusi Lengkap 50+ Produk & Alat Pertanian Nusantara
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm text-[#E2E8F0] leading-relaxed">
            Menyediakan kebutuhan lengkap petani & pekebun: Benih Pangan & Hortikultura, Pupuk Organik & Kimia, Perlindungan Hama, Alat & Traktor Pengolah Tanah, Irigasi Tetes hingga Pakan & Pasca Panen bergaransi mutu resmi.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs text-[#FEF3C7]">
            <div className="flex items-center gap-1.5 bg-[#1B4332]/70 border border-[#52B788]/30 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              <CheckCircle2 className="w-4 h-4 text-[#74C69D]" />
              <span>100% Produk Original & Teruji</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#8B5E3C]/40 border border-[#D5C7B0]/30 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              <CheckCircle2 className="w-4 h-4 text-[#FDE68A]" />
              <span>Bisa Bayar Bank & QRIS</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#1B4332]/70 border border-[#52B788]/30 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              <CheckCircle2 className="w-4 h-4 text-[#74C69D]" />
              <span>Verifikasi Bukti Cepat & Aman</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Automatic Discount Banner */}
      <div className="mt-4 bg-gradient-to-r from-[#FEF3C7] via-[#FFFBEB] to-[#EAE0D0] border-2 border-[#D97706]/40 p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D97706] to-[#92400E] text-white flex items-center justify-center shrink-0 shadow-md">
            <Percent className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#1B4332] text-[#FEF3C7]">
                PROMO OTOMATIS
              </span>
              <h3 className="text-sm sm:text-base font-black text-[#1B4332]">
                Belanja Minimal Rp 1 Juta Otomatis Diskon 10%!
              </h3>
            </div>
            <p className="text-xs text-[#78350F]/90 mt-1">
              Nikmati potongan harga langsung 10% secara otomatis untuk seluruh pembelian produk pertanian dengan total transaksi minimal Rp 1.000.000.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs font-bold text-[#1B4332] bg-white/90 px-3.5 py-2 rounded-2xl border border-[#FDE68A] shadow-2xs">
          <Sparkles className="w-4 h-4 text-[#D97706]" />
          <span>Hemat hingga ratusan ribu rupiah!</span>
        </div>
      </div>

      {/* 3 Earthy Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
        <div className="flex items-center gap-3.5 bg-white p-4 rounded-2xl border border-[#E8DEC8] shadow-2xs hover:border-[#8B5E3C]/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#F4EFE6] text-[#8B5E3C] border border-[#E0D4C0] flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-[#8B5E3C]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1B4332]">Sertifikasi & Garansi Resmi</h4>
            <p className="text-[11px] text-[#78350F]/70">Benih sertifikat BPSB & pupuk terdaftar Kementan RI</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 bg-white p-4 rounded-2xl border border-[#E8DEC8] shadow-2xs hover:border-[#2D6A4F]/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#D8F3DC]/60 text-[#1B4332] border border-[#B7E4C7] flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-[#2D6A4F]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1B4332]">Pengiriman Aman Seluruh Wilayah</h4>
            <p className="text-[11px] text-[#78350F]/70">Pengepakan kuat anti bocor sampai ke pelosok desa</p>
          </div>
        </div>

        <div className="flex flex-col justify-between bg-white p-4 rounded-2xl border border-[#E8DEC8] shadow-2xs hover:border-[#D97706]/40 transition-colors">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5 text-[#D97706]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1B4332]">Konsultasi Budidaya & Bantuan</h4>
              <p className="text-[11px] text-[#78350F]/70">Jika ada kendala silahkan hubungi kami</p>
            </div>
          </div>
          <a
            href="https://wa.me/6285600556628?text=Halo%20EcoAgro,%20ada%20kendala%20yang%20ingin%20saya%20tanyakan"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 bg-[#4A3E31] hover:bg-[#32281E] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer border border-[#6B5A47]"
          >
            <span>Jika ada kendala silahkan hubungi</span>
          </a>
        </div>
      </div>
    </div>
  );
};
