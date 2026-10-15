import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WA_PHONE_NUMBER = '085600556628';
export const WA_API_URL = 'https://wa.me/6285600556628?text=Halo%20EcoAgro,%20ada%20kendala%20yang%20ingin%20saya%20tanyakan%20mengenai%20produk%20dan%20pemesanan';

interface WhatsAppHelpButtonProps {
  className?: string;
  variant?: 'navbar' | 'floating' | 'banner' | 'card' | 'inline';
  customText?: string;
}

export const WhatsAppHelpButton: React.FC<WhatsAppHelpButtonProps> = ({
  className = '',
  variant = 'inline',
  customText,
}) => {
  if (variant === 'floating') {
    return (
      <a
        href={WA_API_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-[#4A3E31] hover:bg-[#32281E] active:bg-[#1E1812] text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-[#E8DEC8]/60 group cursor-pointer ${className}`}
        title="Hubungi CS EcoAgro jika ada kendala"
        aria-label="Jika ada kendala silahkan hubungi"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 fill-[#FEF3C7] text-[#4A3E31] shrink-0" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F59E0B] rounded-full animate-ping" />
        </div>
        <div className="flex flex-col text-left pr-1">
          <span className="text-[10px] font-semibold text-[#D5C7B0] uppercase tracking-wider leading-none">
            Bantuan Pelanggan
          </span>
          <span className="text-xs font-black tracking-tight leading-tight mt-0.5 text-[#FEF3C7]">
            {customText || 'Jika ada kendala silahkan hubungi'}
          </span>
        </div>
      </a>
    );
  }

  if (variant === 'banner') {
    return (
      <a
        href={WA_API_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 bg-[#4A3E31] hover:bg-[#32281E] text-[#FEF3C7] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer border border-[#8B5E3C]/30 ${className}`}
        title="Hubungi CS EcoAgro jika ada kendala"
      >
        <MessageCircle className="w-4 h-4 fill-[#FEF3C7] text-[#4A3E31] shrink-0" />
        <span>{customText || 'Jika ada kendala silahkan hubungi'}</span>
      </a>
    );
  }

  return (
    <a
      href={WA_API_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-[#4A3E31] hover:bg-[#32281E] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs border border-[#6B5A47] ${className}`}
      title="Hubungi CS EcoAgro jika ada kendala"
    >
      <MessageCircle className="w-4 h-4 fill-[#FEF3C7] text-[#4A3E31] shrink-0" />
      <span>{customText || 'Jika ada kendala silahkan hubungi'}</span>
    </a>
  );
};
