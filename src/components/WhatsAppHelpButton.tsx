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
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BA5C] active:bg-[#1DA851] text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/60 group cursor-pointer ${className}`}
        title="Hubungi WhatsApp CS EcoAgro jika ada kendala"
        aria-label="Jika ada kendala silahkan hubungi via WhatsApp"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 fill-white shrink-0 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FEF3C7] rounded-full animate-ping" />
        </div>
        <div className="flex flex-col text-left pr-1">
          <span className="text-[10px] font-semibold text-emerald-100 uppercase tracking-wider leading-none">
            Butuh Bantuan?
          </span>
          <span className="text-xs font-black tracking-tight leading-tight mt-0.5">
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
        className={`inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5C] text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer border border-white/30 ${className}`}
        title="Hubungi WhatsApp CS EcoAgro jika ada kendala"
      >
        <MessageCircle className="w-4 h-4 fill-white shrink-0" />
        <span>{customText || 'Jika ada kendala silahkan hubungi'}</span>
      </a>
    );
  }

  return (
    <a
      href={WA_API_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5C] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs ${className}`}
      title="Hubungi WhatsApp CS EcoAgro jika ada kendala"
    >
      <MessageCircle className="w-4 h-4 fill-white shrink-0" />
      <span>{customText || 'Jika ada kendala silahkan hubungi'}</span>
    </a>
  );
};
